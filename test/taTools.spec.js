describe('taToolsExecuteFunction', function(){
	var scope, startActionResult, editor, $rootScope;
	beforeEach(module('textAngular'));
	beforeEach(inject(function(taToolExecuteAction, _$rootScope_){
		$rootScope = _$rootScope_;
		startActionResult = Math.random();
		scope = {
			taToolExecuteAction: taToolExecuteAction,
			$editor: function(){
				return editor = {
					startCount: 0,
					startAction: function(){
						this.startCount++;
						return startActionResult;
					},
					finishCount: 0,
					endAction: function(){ this.finishCount++; }
				};
			}
		};
	}));
	
	describe('executes the action passing the correct parameters', function(){
		it('should pass the result of startAction Result', function(){
			scope.action = function(deferred, startActionResult){
				expect(startActionResult).toBe(startActionResult);
			};
			$rootScope.$apply(function(){ scope.taToolExecuteAction(); });
		});
		it('should pass a valid deferred object', function(){
			scope.action = function(deferred, startActionResult){
				expect(deferred.resolve).toBeDefined();
				expect(deferred.reject).toBeDefined();
				expect(deferred.notify).toBeDefined();
				expect(deferred.promise).toBeDefined();
			};
			$rootScope.$apply(function(){ scope.taToolExecuteAction(); });
		});
	});
	
	it('doesn\'t error when action not present', function(){
		expect(function(){
			$rootScope.$apply(function(){ scope.taToolExecuteAction(); });
		}).not.toThrow();
	});
	
	it('sets the correct editor if passed', function(){
		var _editor = {endAction: function(){}, startAction: function(){}};
		scope.taToolExecuteAction(_editor);
		expect(scope.$editor()).toBe(_editor);
	});
	
	describe('calls editor action', function(){
		it('start and end when action returns truthy', function(){
			scope.action = function(deferred, startActionResult){ return true; };
			$rootScope.$apply(function(){ scope.taToolExecuteAction(); });
			expect(editor.startCount).toBe(1);
			expect(editor.finishCount).toBe(1);
		});
		
		it('start and end when action returns undefined', function(){
			scope.action = function(deferred, startActionResult){};
			$rootScope.$apply(function(){ scope.taToolExecuteAction(); });
			expect(editor.startCount).toBe(1);
			expect(editor.finishCount).toBe(1);
		});
		
		it('start and not end when action returns false', function(){
			scope.action = function(deferred, startActionResult){ return false; };
			$rootScope.$apply(function(){ scope.taToolExecuteAction(); });
			expect(editor.startCount).toBe(1);
			expect(editor.finishCount).toBe(0);
		});
	});
});