'use strict';

(function() {
	// Hists Controller Spec
	describe('Hists Controller Tests', function() {
		// Initialize global variables
		var HistsController,
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

			// Initialize the Hists controller.
			HistsController = $controller('HistsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Hist object fetched from XHR', inject(function(Hists) {
			// Create sample Hist using the Hists service
			var sampleHist = new Hists({
				name: 'New Hist'
			});

			// Create a sample Hists array that includes the new Hist
			var sampleHists = [sampleHist];

			// Set GET response
			$httpBackend.expectGET('hists').respond(sampleHists);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.hists).toEqualData(sampleHists);
		}));

		it('$scope.findOne() should create an array with one Hist object fetched from XHR using a histId URL parameter', inject(function(Hists) {
			// Define a sample Hist object
			var sampleHist = new Hists({
				name: 'New Hist'
			});

			// Set the URL parameter
			$stateParams.histId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/hists\/([0-9a-fA-F]{24})$/).respond(sampleHist);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.hist).toEqualData(sampleHist);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Hists) {
			// Create a sample Hist object
			var sampleHistPostData = new Hists({
				name: 'New Hist'
			});

			// Create a sample Hist response
			var sampleHistResponse = new Hists({
				_id: '525cf20451979dea2c000001',
				name: 'New Hist'
			});

			// Fixture mock form input values
			scope.name = 'New Hist';

			// Set POST response
			$httpBackend.expectPOST('hists', sampleHistPostData).respond(sampleHistResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Hist was created
			expect($location.path()).toBe('/hists/' + sampleHistResponse._id);
		}));

		it('$scope.update() should update a valid Hist', inject(function(Hists) {
			// Define a sample Hist put data
			var sampleHistPutData = new Hists({
				_id: '525cf20451979dea2c000001',
				name: 'New Hist'
			});

			// Mock Hist in scope
			scope.hist = sampleHistPutData;

			// Set PUT response
			$httpBackend.expectPUT(/hists\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/hists/' + sampleHistPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid histId and remove the Hist from the scope', inject(function(Hists) {
			// Create new Hist object
			var sampleHist = new Hists({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Hists array and include the Hist
			scope.hists = [sampleHist];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/hists\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleHist);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.hists.length).toBe(0);
		}));
	});
}());