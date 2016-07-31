'use strict';

(function() {
	// Bidlogs Controller Spec
	describe('Bidlogs Controller Tests', function() {
		// Initialize global variables
		var BidlogsController,
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

			// Initialize the Bidlogs controller.
			BidlogsController = $controller('BidlogsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Bidlog object fetched from XHR', inject(function(Bidlogs) {
			// Create sample Bidlog using the Bidlogs service
			var sampleBidlog = new Bidlogs({
				name: 'New Bidlog'
			});

			// Create a sample Bidlogs array that includes the new Bidlog
			var sampleBidlogs = [sampleBidlog];

			// Set GET response
			$httpBackend.expectGET('bidlogs').respond(sampleBidlogs);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.bidlogs).toEqualData(sampleBidlogs);
		}));

		it('$scope.findOne() should create an array with one Bidlog object fetched from XHR using a bidlogId URL parameter', inject(function(Bidlogs) {
			// Define a sample Bidlog object
			var sampleBidlog = new Bidlogs({
				name: 'New Bidlog'
			});

			// Set the URL parameter
			$stateParams.bidlogId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/bidlogs\/([0-9a-fA-F]{24})$/).respond(sampleBidlog);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.bidlog).toEqualData(sampleBidlog);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Bidlogs) {
			// Create a sample Bidlog object
			var sampleBidlogPostData = new Bidlogs({
				name: 'New Bidlog'
			});

			// Create a sample Bidlog response
			var sampleBidlogResponse = new Bidlogs({
				_id: '525cf20451979dea2c000001',
				name: 'New Bidlog'
			});

			// Fixture mock form input values
			scope.name = 'New Bidlog';

			// Set POST response
			$httpBackend.expectPOST('bidlogs', sampleBidlogPostData).respond(sampleBidlogResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Bidlog was created
			expect($location.path()).toBe('/bidlogs/' + sampleBidlogResponse._id);
		}));

		it('$scope.update() should update a valid Bidlog', inject(function(Bidlogs) {
			// Define a sample Bidlog put data
			var sampleBidlogPutData = new Bidlogs({
				_id: '525cf20451979dea2c000001',
				name: 'New Bidlog'
			});

			// Mock Bidlog in scope
			scope.bidlog = sampleBidlogPutData;

			// Set PUT response
			$httpBackend.expectPUT(/bidlogs\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/bidlogs/' + sampleBidlogPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid bidlogId and remove the Bidlog from the scope', inject(function(Bidlogs) {
			// Create new Bidlog object
			var sampleBidlog = new Bidlogs({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Bidlogs array and include the Bidlog
			scope.bidlogs = [sampleBidlog];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/bidlogs\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleBidlog);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.bidlogs.length).toBe(0);
		}));
	});
}());