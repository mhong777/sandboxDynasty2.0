'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Gvar = mongoose.model('Gvar'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, gvar;

/**
 * Gvar routes tests
 */
describe('Gvar CRUD tests', function() {
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

		// Save a user to the test db and create new Gvar
		user.save(function() {
			gvar = {
				name: 'Gvar Name'
			};

			done();
		});
	});

	it('should be able to save Gvar instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Gvar
				agent.post('/gvars')
					.send(gvar)
					.expect(200)
					.end(function(gvarSaveErr, gvarSaveRes) {
						// Handle Gvar save error
						if (gvarSaveErr) done(gvarSaveErr);

						// Get a list of Gvars
						agent.get('/gvars')
							.end(function(gvarsGetErr, gvarsGetRes) {
								// Handle Gvar save error
								if (gvarsGetErr) done(gvarsGetErr);

								// Get Gvars list
								var gvars = gvarsGetRes.body;

								// Set assertions
								(gvars[0].user._id).should.equal(userId);
								(gvars[0].name).should.match('Gvar Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Gvar instance if not logged in', function(done) {
		agent.post('/gvars')
			.send(gvar)
			.expect(401)
			.end(function(gvarSaveErr, gvarSaveRes) {
				// Call the assertion callback
				done(gvarSaveErr);
			});
	});

	it('should not be able to save Gvar instance if no name is provided', function(done) {
		// Invalidate name field
		gvar.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Gvar
				agent.post('/gvars')
					.send(gvar)
					.expect(400)
					.end(function(gvarSaveErr, gvarSaveRes) {
						// Set message assertion
						(gvarSaveRes.body.message).should.match('Please fill Gvar name');
						
						// Handle Gvar save error
						done(gvarSaveErr);
					});
			});
	});

	it('should be able to update Gvar instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Gvar
				agent.post('/gvars')
					.send(gvar)
					.expect(200)
					.end(function(gvarSaveErr, gvarSaveRes) {
						// Handle Gvar save error
						if (gvarSaveErr) done(gvarSaveErr);

						// Update Gvar name
						gvar.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Gvar
						agent.put('/gvars/' + gvarSaveRes.body._id)
							.send(gvar)
							.expect(200)
							.end(function(gvarUpdateErr, gvarUpdateRes) {
								// Handle Gvar update error
								if (gvarUpdateErr) done(gvarUpdateErr);

								// Set assertions
								(gvarUpdateRes.body._id).should.equal(gvarSaveRes.body._id);
								(gvarUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Gvars if not signed in', function(done) {
		// Create new Gvar model instance
		var gvarObj = new Gvar(gvar);

		// Save the Gvar
		gvarObj.save(function() {
			// Request Gvars
			request(app).get('/gvars')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Gvar if not signed in', function(done) {
		// Create new Gvar model instance
		var gvarObj = new Gvar(gvar);

		// Save the Gvar
		gvarObj.save(function() {
			request(app).get('/gvars/' + gvarObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', gvar.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Gvar instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Gvar
				agent.post('/gvars')
					.send(gvar)
					.expect(200)
					.end(function(gvarSaveErr, gvarSaveRes) {
						// Handle Gvar save error
						if (gvarSaveErr) done(gvarSaveErr);

						// Delete existing Gvar
						agent.delete('/gvars/' + gvarSaveRes.body._id)
							.send(gvar)
							.expect(200)
							.end(function(gvarDeleteErr, gvarDeleteRes) {
								// Handle Gvar error error
								if (gvarDeleteErr) done(gvarDeleteErr);

								// Set assertions
								(gvarDeleteRes.body._id).should.equal(gvarSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Gvar instance if not signed in', function(done) {
		// Set Gvar user 
		gvar.user = user;

		// Create new Gvar model instance
		var gvarObj = new Gvar(gvar);

		// Save the Gvar
		gvarObj.save(function() {
			// Try deleting Gvar
			request(app).delete('/gvars/' + gvarObj._id)
			.expect(401)
			.end(function(gvarDeleteErr, gvarDeleteRes) {
				// Set message assertion
				(gvarDeleteRes.body.message).should.match('User is not logged in');

				// Handle Gvar error error
				done(gvarDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Gvar.remove().exec();
		done();
	});
});