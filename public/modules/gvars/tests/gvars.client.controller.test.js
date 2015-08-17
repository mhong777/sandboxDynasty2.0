'use strict';

(function() {
	// Gvars Controller Spec
	describe('Gvars Controller Tests', function() {
		// Initialize global variables
		var GvarsController,
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

			// Initialize the Gvars controller.
			GvarsController = $controller('GvarsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Gvar object fetched from XHR', inject(function(Gvars) {
			// Create sample Gvar using the Gvars service
			var sampleGvar = new Gvars({
				name: 'New Gvar'
			});

			// Create a sample Gvars array that includes the new Gvar
			var sampleGvars = [sampleGvar];

			// Set GET response
			$httpBackend.expectGET('gvars').respond(sampleGvars);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.gvars).toEqualData(sampleGvars);
		}));

		it('$scope.findOne() should create an array with one Gvar object fetched from XHR using a gvarId URL parameter', inject(function(Gvars) {
			// Define a sample Gvar object
			var sampleGvar = new Gvars({
				name: 'New Gvar'
			});

			// Set the URL parameter
			$stateParams.gvarId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/gvars\/([0-9a-fA-F]{24})$/).respond(sampleGvar);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.gvar).toEqualData(sampleGvar);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Gvars) {
			// Create a sample Gvar object
			var sampleGvarPostData = new Gvars({
				name: 'New Gvar'
			});

			// Create a sample Gvar response
			var sampleGvarResponse = new Gvars({
				_id: '525cf20451979dea2c000001',
				name: 'New Gvar'
			});

			// Fixture mock form input values
			scope.name = 'New Gvar';

			// Set POST response
			$httpBackend.expectPOST('gvars', sampleGvarPostData).respond(sampleGvarResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Gvar was created
			expect($location.path()).toBe('/gvars/' + sampleGvarResponse._id);
		}));

		it('$scope.update() should update a valid Gvar', inject(function(Gvars) {
			// Define a sample Gvar put data
			var sampleGvarPutData = new Gvars({
				_id: '525cf20451979dea2c000001',
				name: 'New Gvar'
			});

			// Mock Gvar in scope
			scope.gvar = sampleGvarPutData;

			// Set PUT response
			$httpBackend.expectPUT(/gvars\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/gvars/' + sampleGvarPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid gvarId and remove the Gvar from the scope', inject(function(Gvars) {
			// Create new Gvar object
			var sampleGvar = new Gvars({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Gvars array and include the Gvar
			scope.gvars = [sampleGvar];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/gvars\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleGvar);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.gvars.length).toBe(0);
		}));
	});
}());