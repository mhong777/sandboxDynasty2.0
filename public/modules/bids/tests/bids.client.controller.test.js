'use strict';

(function() {
	// Bids Controller Spec
	describe('Bids Controller Tests', function() {
		// Initialize global variables
		var BidsController,
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

			// Initialize the Bids controller.
			BidsController = $controller('BidsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Bid object fetched from XHR', inject(function(Bids) {
			// Create sample Bid using the Bids service
			var sampleBid = new Bids({
				name: 'New Bid'
			});

			// Create a sample Bids array that includes the new Bid
			var sampleBids = [sampleBid];

			// Set GET response
			$httpBackend.expectGET('bids').respond(sampleBids);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.bids).toEqualData(sampleBids);
		}));

		it('$scope.findOne() should create an array with one Bid object fetched from XHR using a bidId URL parameter', inject(function(Bids) {
			// Define a sample Bid object
			var sampleBid = new Bids({
				name: 'New Bid'
			});

			// Set the URL parameter
			$stateParams.bidId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/bids\/([0-9a-fA-F]{24})$/).respond(sampleBid);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.bid).toEqualData(sampleBid);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Bids) {
			// Create a sample Bid object
			var sampleBidPostData = new Bids({
				name: 'New Bid'
			});

			// Create a sample Bid response
			var sampleBidResponse = new Bids({
				_id: '525cf20451979dea2c000001',
				name: 'New Bid'
			});

			// Fixture mock form input values
			scope.name = 'New Bid';

			// Set POST response
			$httpBackend.expectPOST('bids', sampleBidPostData).respond(sampleBidResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Bid was created
			expect($location.path()).toBe('/bids/' + sampleBidResponse._id);
		}));

		it('$scope.update() should update a valid Bid', inject(function(Bids) {
			// Define a sample Bid put data
			var sampleBidPutData = new Bids({
				_id: '525cf20451979dea2c000001',
				name: 'New Bid'
			});

			// Mock Bid in scope
			scope.bid = sampleBidPutData;

			// Set PUT response
			$httpBackend.expectPUT(/bids\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/bids/' + sampleBidPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid bidId and remove the Bid from the scope', inject(function(Bids) {
			// Create new Bid object
			var sampleBid = new Bids({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Bids array and include the Bid
			scope.bids = [sampleBid];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/bids\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleBid);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.bids.length).toBe(0);
		}));
	});
}());