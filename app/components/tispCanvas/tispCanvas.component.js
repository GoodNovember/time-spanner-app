(function() {
	'use strict';

	angular
		.module("app")
		.component("tispCanvas",{
			bindings:{
				ctxType:"@",
				bindCtx:"&"
			},
			controller:tispCanvasCtrl,
			// controllerAs:'ctrl',
			templateUrl:"./app/components/tispCanvas/tispCanvas.html"
		});//end component

	tispCanvasCtrl.$inject = ["$element"];
	function tispCanvasCtrl($element){
		var $ctrl = this;
		
		$ctrl.$onInit = init;
		
		function init(){
			var canvasHolder = $element.children()[0]
			var canvas = canvasHolder.children[0]
			var ctx = canvas.getContext($ctrl.ctxType || "2d")
			if(typeof $ctrl.bindCtx === "function"){
				$ctrl.bindCtx({ctx:ctx})
			}
			// console.log(ctx)
			console.log("init component tispCanvas");
		}// end init
		
	}//end controller
	
	
})();//