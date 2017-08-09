(function() {
	'use strict';

	angular
		.module("app")
		.component("tispRoot",{
			// bindings:{bindings},
			controller:tispRootCtrl,
			templateUrl:"./app/components/tispRoot/tispRoot.html",
		});//end component

	tispRootCtrl.$inject = [];
	function tispRootCtrl(){
		var $ctrl = this;
		
		$ctrl.$onInit = init;
		
		function init(){
			console.log("init component tispRoot");
		}// end init
		
	}//end controller
	
	
})();//