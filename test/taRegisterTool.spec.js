describe('Adding tools to taTools', function(){
	'use strict';
	beforeEach(module('textAngular'));
	
	it('should require a name', inject(function(taRegisterTool){
		expect(taRegisterTool).toThrow("textAngular Error: A name is required for a Tool Definition");
		expect(function(){taRegisterTool('');}).toThrow("textAngular Error: A name is required for a Tool Definition");
	}));
	it('should require a display element', inject(function(taRegisterTool){
		expect(function(){taRegisterTool('test', {});}).toThrow('textAngular Error: Tool Definition for "test" does not have a valid display value');
		expect(function(){taRegisterTool('test', {display: 'testbad'});}).toThrow('textAngular Error: Tool Definition for "test" does not have a valid display value');
	}));
	it('should add a valid tool to taTools', inject(function(taRegisterTool, taTools){
		var toolDef = {display: '<button></buton>'};
		taRegisterTool('test', toolDef);
		expect(taTools['test']).toBe(toolDef);
	}));
});