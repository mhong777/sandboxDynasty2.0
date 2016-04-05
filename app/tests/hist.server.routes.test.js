'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Hist = mongoose.model('Hist'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, hist;

/**
 * Hist routes tests
 */
describe('Hist CRUD tests', function() {
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

		// Save a user to the test db and create new Hist
		user.save(function() {
			hist = {
				name: 'Hist Name'
			};

			done();
		});
	});

	it('should be able to save Hist instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Hist
				agent.post('/hists')
					.send(hist)
					.expect(200)
					.end(function(histSaveErr, histSaveRes) {
						// Handle Hist save error
						if (histSaveErr) done(histSaveErr);

						// Get a list of Hists
						agent.get('/hists')
							.end(function(histsGetErr, histsGetRes) {
								// Handle Hist save error
								if (histsGetErr) done(histsGetErr);

								// Get Hists list
								var hists = histsGetRes.body;

								// Set assertions
								(hists[0].user._id).should.equal(userId);
								(hists[0].name).should.match('Hist Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Hist instance if not logged in', function(done) {
		agent.post('/hists')
			.send(hist)
			.expect(401)
			.end(function(histSaveErr, histSaveRes) {
				// Call the assertion callback
				done(histSaveErr);
			});
	});

	it('should not be able to save Hist instance if no name is provided', function(done) {
		// Invalidate name field
		hist.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Hist
				agent.post('/hists')
					.send(hist)
					.expect(400)
					.end(function(histSaveErr, histSaveRes) {
						// Set message assertion
						(histSaveRes.body.message).should.match('Please fill Hist name');
						
						// Handle Hist save error
						done(histSaveErr);
					});
			});
	});

	it('should be able to update Hist instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Hist
				agent.post('/hists')
					.send(hist)
					.expect(200)
					.end(function(histSaveErr, histSaveRes) {
						// Handle Hist save error
						if (histSaveErr) done(histSaveErr);

						// Update Hist name
						hist.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Hist
						agent.put('/hists/' + histSaveRes.body._id)
							.send(hist)
							.expect(200)
							.end(function(histUpdateErr, histUpdateRes) {
								// Handle Hist update error
								if (histUpdateErr) done(histUpdateErr);

								// Set assertions
								(histUpdateRes.body._id).should.equal(histSaveRes.body._id);
								(histUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Hists if not signed in', function(done) {
		// Create new Hist model instance
		var histObj = new Hist(hist);

		// Save the Hist
		histObj.save(function() {
			// Request Hists
			request(app).get('/hists')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Hist if not signed in', function(done) {
		// Create new Hist model instance
		var histObj = new Hist(hist);

		// Save the Hist
		histObj.save(function() {
			request(app).get('/hists/' + histObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', hist.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Hist instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Hist
				agent.post('/hists')
					.send(hist)
					.expect(200)
					.end(function(histSaveErr, histSaveRes) {
						// Handle Hist save error
						if (histSaveErr) done(histSaveErr);

						// Delete existing Hist
						agent.delete('/hists/' + histSaveRes.body._id)
							.send(hist)
							.expect(200)
							.end(function(histDeleteErr, histDeleteRes) {
								// Handle Hist error error
								if (histDeleteErr) done(histDeleteErr);

								// Set assertions
								(histDeleteRes.body._id).should.equal(histSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Hist instance if not signed in', function(done) {
		// Set Hist user 
		hist.user = user;

		// Create new Hist model instance
		var histObj = new Hist(hist);

		// Save the Hist
		histObj.save(function() {
			// Try deleting Hist
			request(app).delete('/hists/' + histObj._id)
			.expect(401)
			.end(function(histDeleteErr, histDeleteRes) {
				// Set message assertion
				(histDeleteRes.body.message).should.match('User is not logged in');

				// Handle Hist error error
				done(histDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Hist.remove().exec();
		done();
	});
});