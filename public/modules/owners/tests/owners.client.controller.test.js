'use strict';

(function() {
	// Owners Controller Spec
	describe('Owners Controller Tests', function() {
		// Initialize global variables
		var OwnersController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Owners controller.
			OwnersController = $controller('OwnersController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Owner object fetched from XHR', inject(function(Owners) {
			// Create sample Owner using the Owners service
			var sampleOwner = new Owners({
				name: 'New Owner'
			});

			// Create a sample Owners array that includes the new Owner
			var sampleOwners = [sampleOwner];

			// Set GET response
			$httpBackend.expectGET('owners').respond(sampleOwners);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.owners).toEqualData(sampleOwners);
		}));

		it('$scope.findOne() should create an array with one Owner object fetched from XHR using a ownerId URL parameter', inject(function(Owners) {
			// Define a sample Owner object
			var sampleOwner = new Owners({
				name: 'New Owner'
			});

			// Set the URL parameter
			$stateParams.ownerId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/owners\/([0-9a-fA-F]{24})$/).respond(sampleOwner);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.owner).toEqualData(sampleOwner);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Owners) {
			// Create a sample Owner object
			var sampleOwnerPostData = new Owners({
				name: 'New Owner'
			});

			// Create a sample Owner response
			var sampleOwnerResponse = new Owners({
				_id: '525cf20451979dea2c000001',
				name: 'New Owner'
			});

			// Fixture mock form input values
			scope.name = 'New Owner';

			// Set POST response
			$httpBackend.expectPOST('owners', sampleOwnerPostData).respond(sampleOwnerResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Owner was created
			expect($location.path()).toBe('/owners/' + sampleOwnerResponse._id);
		}));

		it('$scope.update() should update a valid Owner', inject(function(Owners) {
			// Define a sample Owner put data
			var sampleOwnerPutData = new Owners({
				_id: '525cf20451979dea2c000001',
				name: 'New Owner'
			});

			// Mock Owner in scope
			scope.owner = sampleOwnerPutData;

			// Set PUT response
			$httpBackend.expectPUT(/owners\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/owners/' + sampleOwnerPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid ownerId and remove the Owner from the scope', inject(function(Owners) {
			// Create new Owner object
			var sampleOwner = new Owners({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Owners array and include the Owner
			scope.owners = [sampleOwner];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/owners\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleOwner);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.owners.length).toBe(0);
		}));
	});
}());