(function() {
'use strict';

	angular
		.module('app')
		.factory('geometryFactory', geometryFactory);

	geometryFactory.inject = ['$q'];
	function geometryFactory($q) {
		var service = {
			Point:Point,
			PointZero:new Point(0,0)
		};
		
		return service;

		////////////////
		function Point(x, y) { 
			var self = this;
			self.x = x
			self.y = y

			self.adjust = function(modX, modY){
				self.x += modX
				self.y += modY
			}

			self.adjustByPoint = function(otherPoint){
				self.x += otherPoint.x
				self.y += otherPoint.y
			}

			self.clone = function(){
				return new Point(self.x, self.y)
			}

			self.isEqualTo = function(otherPoint){
				var xA = self.x
				var yA = self.y
				var xB = otherPoint.x
				var yB = otherPoint.y
				return (xA === xB) && (yA === yB)
			}

			self.getDifference = function(otherPoint){
				var xA = self.x
				var yA = self.y
				var xB = otherPoint.x
				var yB = otherPoint.y

				return new Point(xA - xB, yA - yB)
			}

		}
	}
})();