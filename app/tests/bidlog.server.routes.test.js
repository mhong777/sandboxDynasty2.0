'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Bidlog = mongoose.model('Bidlog'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, bidlog;

/**
 * Bidlog routes tests
 */
describe('Bidlog CRUD tests', function() {
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

		// Save a user to the test db and create new Bidlog
		user.save(function() {
			bidlog = {
				name: 'Bidlog Name'
			};

			done();
		});
	});

	it('should be able to save Bidlog instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Bidlog
				agent.post('/bidlogs')
					.send(bidlog)
					.expect(200)
					.end(function(bidlogSaveErr, bidlogSaveRes) {
						// Handle Bidlog save error
						if (bidlogSaveErr) done(bidlogSaveErr);

						// Get a list of Bidlogs
						agent.get('/bidlogs')
							.end(function(bidlogsGetErr, bidlogsGetRes) {
								// Handle Bidlog save error
								if (bidlogsGetErr) done(bidlogsGetErr);

								// Get Bidlogs list
								var bidlogs = bidlogsGetRes.body;

								// Set assertions
								(bidlogs[0].user._id).should.equal(userId);
								(bidlogs[0].name).should.match('Bidlog Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Bidlog instance if not logged in', function(done) {
		agent.post('/bidlogs')
			.send(bidlog)
			.expect(401)
			.end(function(bidlogSaveErr, bidlogSaveRes) {
				// Call the assertion callback
				done(bidlogSaveErr);
			});
	});

	it('should not be able to save Bidlog instance if no name is provided', function(done) {
		// Invalidate name field
		bidlog.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Bidlog
				agent.post('/bidlogs')
					.send(bidlog)
					.expect(400)
					.end(function(bidlogSaveErr, bidlogSaveRes) {
						// Set message assertion
						(bidlogSaveRes.body.message).should.match('Please fill Bidlog name');
						
						// Handle Bidlog save error
						done(bidlogSaveErr);
					});
			});
	});

	it('should be able to update Bidlog instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Bidlog
				agent.post('/bidlogs')
					.send(bidlog)
					.expect(200)
					.end(function(bidlogSaveErr, bidlogSaveRes) {
						// Handle Bidlog save error
						if (bidlogSaveErr) done(bidlogSaveErr);

						// Update Bidlog name
						bidlog.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Bidlog
						agent.put('/bidlogs/' + bidlogSaveRes.body._id)
							.send(bidlog)
							.expect(200)
							.end(function(bidlogUpdateErr, bidlogUpdateRes) {
								// Handle Bidlog update error
								if (bidlogUpdateErr) done(bidlogUpdateErr);

								// Set assertions
								(bidlogUpdateRes.body._id).should.equal(bidlogSaveRes.body._id);
								(bidlogUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Bidlogs if not signed in', function(done) {
		// Create new Bidlog model instance
		var bidlogObj = new Bidlog(bidlog);

		// Save the Bidlog
		bidlogObj.save(function() {
			// Request Bidlogs
			request(app).get('/bidlogs')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Bidlog if not signed in', function(done) {
		// Create new Bidlog model instance
		var bidlogObj = new Bidlog(bidlog);

		// Save the Bidlog
		bidlogObj.save(function() {
			request(app).get('/bidlogs/' + bidlogObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', bidlog.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Bidlog instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Bidlog
				agent.post('/bidlogs')
					.send(bidlog)
					.expect(200)
					.end(function(bidlogSaveErr, bidlogSaveRes) {
						// Handle Bidlog save error
						if (bidlogSaveErr) done(bidlogSaveErr);

						// Delete existing Bidlog
						agent.delete('/bidlogs/' + bidlogSaveRes.body._id)
							.send(bidlog)
							.expect(200)
							.end(function(bidlogDeleteErr, bidlogDeleteRes) {
								// Handle Bidlog error error
								if (bidlogDeleteErr) done(bidlogDeleteErr);

								// Set assertions
								(bidlogDeleteRes.body._id).should.equal(bidlogSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Bidlog instance if not signed in', function(done) {
		// Set Bidlog user 
		bidlog.user = user;

		// Create new Bidlog model instance
		var bidlogObj = new Bidlog(bidlog);

		// Save the Bidlog
		bidlogObj.save(function() {
			// Try deleting Bidlog
			request(app).delete('/bidlogs/' + bidlogObj._id)
			.expect(401)
			.end(function(bidlogDeleteErr, bidlogDeleteRes) {
				// Set message assertion
				(bidlogDeleteRes.body.message).should.match('User is not logged in');

				// Handle Bidlog error error
				done(bidlogDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Bidlog.remove().exec();
		done();
	});
});