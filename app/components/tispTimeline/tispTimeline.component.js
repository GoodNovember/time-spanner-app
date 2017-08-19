(function() {
	'use strict';

	angular
		.module("app")
		.component("tispTimeline",{
			// bindings:{bindings},
			controller:tispTimelineCtrl,
			// controllerAs:'ctrl',
			templateUrl:"./app/components/tispTimeline/tispTimeline.html"
		});//end component

	tispTimelineCtrl.$inject = ["$element", "timelineFactory", "movementFactory","geometryFactory", "$scope"];
	function tispTimelineCtrl($element, timelineFactory, mvt, geometryFactory, $scope){
		var $ctrl = this;
		
		var dpr = window.devicePixelRatio || 1

		$ctrl.$onInit = init;
		$ctrl.heartbeatEnabled = false;

		$ctrl.startHeartbeat = function(){
			$ctrl.heartbeatEnabled = true
			requestAnimationFrame(heartbeat)
		}
		$ctrl.stopHeartbeat = function(){
			$ctrl.heartbeatEnabled = false
		}

		$ctrl.ctxBinder = function(ctx){
			// console.log("Got CTX:", ctx)
			$ctrl.ctx = ctx;
			$ctrl.startHeartbeat()
		}

		function init(){
			console.log("init component tispTimeline");
			mvt.bindTo($element)
		}
		// end init
		
		function heartbeat(timestamp){
			var sized = false
			if($ctrl.ctx){
				sized = sizeCanvas($ctrl.ctx)
			}

			draw(timestamp, sized)

			mvt.update(timestamp)

			if($ctrl.heartbeatEnabled){
				requestAnimationFrame(heartbeat)
			}
		} // end heartbeat
		
		function draw(timestamp, sized){

			var dpr = window.devicePixelRatio || 1

			var VIEWPORT = {
				wasSized:sized,
				maxPoint:new geometryFactory.Point($ctrl.ctx.canvas.width * dpr, $ctrl.ctx.canvas.height * dpr)
			}

			timelineFactory.draw(mvt.getState(), VIEWPORT, $ctrl.ctx, timestamp)
		}

		function sizeCanvas(ctx){
			var parent = ctx.canvas.parentNode
			var canvas = ctx.canvas
			var dpr = window.devicePixelRatio || 1
			var targetWidth = parent.clientWidth * dpr
			var targetHeight = parent.clientHeight * dpr
			if(ctx.canvas.width !== targetWidth || ctx.canvas.height !== targetHeight){
				ctx.canvas.width = targetWidth
				ctx.canvas.height = targetHeight
				return true
			}else{
				return false
			}
		}
		


	}//end controller
	
	
})();//end tisp timeline