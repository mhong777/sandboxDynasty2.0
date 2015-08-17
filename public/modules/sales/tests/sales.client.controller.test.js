'use strict';

(function() {
	// Sales Controller Spec
	describe('Sales Controller Tests', function() {
		// Initialize global variables
		var SalesController,
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

			// Initialize the Sales controller.
			SalesController = $controller('SalesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Sale object fetched from XHR', inject(function(Sales) {
			// Create sample Sale using the Sales service
			var sampleSale = new Sales({
				name: 'New Sale'
			});

			// Create a sample Sales array that includes the new Sale
			var sampleSales = [sampleSale];

			// Set GET response
			$httpBackend.expectGET('sales').respond(sampleSales);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.sales).toEqualData(sampleSales);
		}));

		it('$scope.findOne() should create an array with one Sale object fetched from XHR using a saleId URL parameter', inject(function(Sales) {
			// Define a sample Sale object
			var sampleSale = new Sales({
				name: 'New Sale'
			});

			// Set the URL parameter
			$stateParams.saleId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/sales\/([0-9a-fA-F]{24})$/).respond(sampleSale);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.sale).toEqualData(sampleSale);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Sales) {
			// Create a sample Sale object
			var sampleSalePostData = new Sales({
				name: 'New Sale'
			});

			// Create a sample Sale response
			var sampleSaleResponse = new Sales({
				_id: '525cf20451979dea2c000001',
				name: 'New Sale'
			});

			// Fixture mock form input values
			scope.name = 'New Sale';

			// Set POST response
			$httpBackend.expectPOST('sales', sampleSalePostData).respond(sampleSaleResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Sale was created
			expect($location.path()).toBe('/sales/' + sampleSaleResponse._id);
		}));

		it('$scope.update() should update a valid Sale', inject(function(Sales) {
			// Define a sample Sale put data
			var sampleSalePutData = new Sales({
				_id: '525cf20451979dea2c000001',
				name: 'New Sale'
			});

			// Mock Sale in scope
			scope.sale = sampleSalePutData;

			// Set PUT response
			$httpBackend.expectPUT(/sales\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/sales/' + sampleSalePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid saleId and remove the Sale from the scope', inject(function(Sales) {
			// Create new Sale object
			var sampleSale = new Sales({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Sales array and include the Sale
			scope.sales = [sampleSale];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/sales\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleSale);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.sales.length).toBe(0);
		}));
	});
}());