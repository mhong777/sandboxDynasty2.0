'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Bid = mongoose.model('Bid'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, bid;

/**
 * Bid routes tests
 */
describe('Bid CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Bid
		user.save(function() {
			bid = {
				name: 'Bid Name'
			};

			done();
		});
	});

	it('should be able to save Bid instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Bid
				agent.post('/bids')
					.send(bid)
					.expect(200)
					.end(function(bidSaveErr, bidSaveRes) {
						// Handle Bid save error
						if (bidSaveErr) done(bidSaveErr);

						// Get a list of Bids
						agent.get('/bids')
							.end(function(bidsGetErr, bidsGetRes) {
								// Handle Bid save error
								if (bidsGetErr) done(bidsGetErr);

								// Get Bids list
								var bids = bidsGetRes.body;

								// Set assertions
								(bids[0].user._id).should.equal(userId);
								(bids[0].name).should.match('Bid Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Bid instance if not logged in', function(done) {
		agent.post('/bids')
			.send(bid)
			.expect(401)
			.end(function(bidSaveErr, bidSaveRes) {
				// Call the assertion callback
				done(bidSaveErr);
			});
	});

	it('should not be able to save Bid instance if no name is provided', function(done) {
		// Invalidate name field
		bid.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Bid
				agent.post('/bids')
					.send(bid)
					.expect(400)
					.end(function(bidSaveErr, bidSaveRes) {
						// Set message assertion
						(bidSaveRes.body.message).should.match('Please fill Bid name');
						
						// Handle Bid save error
						done(bidSaveErr);
					});
			});
	});

	it('should be able to update Bid instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Bid
				agent.post('/bids')
					.send(bid)
					.expect(200)
					.end(function(bidSaveErr, bidSaveRes) {
						// Handle Bid save error
						if (bidSaveErr) done(bidSaveErr);

						// Update Bid name
						bid.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Bid
						agent.put('/bids/' + bidSaveRes.body._id)
							.send(bid)
							.expect(200)
							.end(function(bidUpdateErr, bidUpdateRes) {
								// Handle Bid update error
								if (bidUpdateErr) done(bidUpdateErr);

								// Set assertions
								(bidUpdateRes.body._id).should.equal(bidSaveRes.body._id);
								(bidUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Bids if not signed in', function(done) {
		// Create new Bid model instance
		var bidObj = new Bid(bid);

		// Save the Bid
		bidObj.save(function() {
			// Request Bids
			request(app).get('/bids')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Bid if not signed in', function(done) {
		// Create new Bid model instance
		var bidObj = new Bid(bid);

		// Save the Bid
		bidObj.save(function() {
			request(app).get('/bids/' + bidObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', bid.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Bid instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Bid
				agent.post('/bids')
					.send(bid)
					.expect(200)
					.end(function(bidSaveErr, bidSaveRes) {
						// Handle Bid save error
						if (bidSaveErr) done(bidSaveErr);

						// Delete existing Bid
						agent.delete('/bids/' + bidSaveRes.body._id)
							.send(bid)
							.expect(200)
							.end(function(bidDeleteErr, bidDeleteRes) {
								// Handle Bid error error
								if (bidDeleteErr) done(bidDeleteErr);

								// Set assertions
								(bidDeleteRes.body._id).should.equal(bidSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Bid instance if not signed in', function(done) {
		// Set Bid user 
		bid.user = user;

		// Create new Bid model instance
		var bidObj = new Bid(bid);

		// Save the Bid
		bidObj.save(function() {
			// Try deleting Bid
			request(app).delete('/bids/' + bidObj._id)
			.expect(401)
			.end(function(bidDeleteErr, bidDeleteRes) {
				// Set message assertion
				(bidDeleteRes.body.message).should.match('User is not logged in');

				// Handle Bid error error
				done(bidDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Bid.remove().exec();
		done();
	});
});