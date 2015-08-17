'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Sale = mongoose.model('Sale'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, sale;

/**
 * Sale routes tests
 */
describe('Sale CRUD tests', function() {
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

		// Save a user to the test db and create new Sale
		user.save(function() {
			sale = {
				name: 'Sale Name'
			};

			done();
		});
	});

	it('should be able to save Sale instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Sale
				agent.post('/sales')
					.send(sale)
					.expect(200)
					.end(function(saleSaveErr, saleSaveRes) {
						// Handle Sale save error
						if (saleSaveErr) done(saleSaveErr);

						// Get a list of Sales
						agent.get('/sales')
							.end(function(salesGetErr, salesGetRes) {
								// Handle Sale save error
								if (salesGetErr) done(salesGetErr);

								// Get Sales list
								var sales = salesGetRes.body;

								// Set assertions
								(sales[0].user._id).should.equal(userId);
								(sales[0].name).should.match('Sale Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Sale instance if not logged in', function(done) {
		agent.post('/sales')
			.send(sale)
			.expect(401)
			.end(function(saleSaveErr, saleSaveRes) {
				// Call the assertion callback
				done(saleSaveErr);
			});
	});

	it('should not be able to save Sale instance if no name is provided', function(done) {
		// Invalidate name field
		sale.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Sale
				agent.post('/sales')
					.send(sale)
					.expect(400)
					.end(function(saleSaveErr, saleSaveRes) {
						// Set message assertion
						(saleSaveRes.body.message).should.match('Please fill Sale name');
						
						// Handle Sale save error
						done(saleSaveErr);
					});
			});
	});

	it('should be able to update Sale instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Sale
				agent.post('/sales')
					.send(sale)
					.expect(200)
					.end(function(saleSaveErr, saleSaveRes) {
						// Handle Sale save error
						if (saleSaveErr) done(saleSaveErr);

						// Update Sale name
						sale.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Sale
						agent.put('/sales/' + saleSaveRes.body._id)
							.send(sale)
							.expect(200)
							.end(function(saleUpdateErr, saleUpdateRes) {
								// Handle Sale update error
								if (saleUpdateErr) done(saleUpdateErr);

								// Set assertions
								(saleUpdateRes.body._id).should.equal(saleSaveRes.body._id);
								(saleUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Sales if not signed in', function(done) {
		// Create new Sale model instance
		var saleObj = new Sale(sale);

		// Save the Sale
		saleObj.save(function() {
			// Request Sales
			request(app).get('/sales')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Sale if not signed in', function(done) {
		// Create new Sale model instance
		var saleObj = new Sale(sale);

		// Save the Sale
		saleObj.save(function() {
			request(app).get('/sales/' + saleObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', sale.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Sale instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Sale
				agent.post('/sales')
					.send(sale)
					.expect(200)
					.end(function(saleSaveErr, saleSaveRes) {
						// Handle Sale save error
						if (saleSaveErr) done(saleSaveErr);

						// Delete existing Sale
						agent.delete('/sales/' + saleSaveRes.body._id)
							.send(sale)
							.expect(200)
							.end(function(saleDeleteErr, saleDeleteRes) {
								// Handle Sale error error
								if (saleDeleteErr) done(saleDeleteErr);

								// Set assertions
								(saleDeleteRes.body._id).should.equal(saleSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Sale instance if not signed in', function(done) {
		// Set Sale user 
		sale.user = user;

		// Create new Sale model instance
		var saleObj = new Sale(sale);

		// Save the Sale
		saleObj.save(function() {
			// Try deleting Sale
			request(app).delete('/sales/' + saleObj._id)
			.expect(401)
			.end(function(saleDeleteErr, saleDeleteRes) {
				// Set message assertion
				(saleDeleteRes.body.message).should.match('User is not logged in');

				// Handle Sale error error
				done(saleDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Sale.remove().exec();
		done();
	});
});