(function() {
'use strict';

	angular
		.module('app')
		.factory('geometryFactory', geometryFactory);

	geometryFactory.inject = [];
	function geometryFactory() {
		var service = {
			Point:Point,
		};
		
		return service;

		////////////////
		function Point(x, y) { 
			var self = this;

			var localState = {}

			localState.x = x || 0
			localState.y = y || 0 

			self.getX = function(){
				return localState.x
			}

			self.getY = function(){
				return localState.y
			}

			self.setX = function(newX){
				localState.x = newX
				return self
			}
			self.setY = function(newY){
				localState.y = newY
				return self
			}

			self.adjustX = function(modX){
				self.setX(self.getX() + modX)
				return self
			}

			self.adjustY = function(modY){
				self.setY(self.getY() + modY)
				return self
			}

			self.adjust = function(modX, modY){
				self.adjustX(modX)
				self.adjustY(modY)
				return self
			}
			
			self.adjustByPoint = function(otherPoint){
				self.adjust(otherPoint.getX(), otherPoint.getY())
				return self
			}

			self.adjustXByPoint = function(otherPoint){
				self.adjustX(otherPoint.getX())
				return self
			}

			self.adjustYByPoint = function(otherPoint){
				self.adjustY(otherPoint.getY())
				return self
			}

			self.clone = function(){
				return new Point(self.getX(), self.getY())
			}

			self.isEqualTo = function(otherPoint){
				var xA = self.getX()
				var yA = self.getY()
				var xB = otherPoint.getX()
				var yB = otherPoint.getY()
				return (xA === xB) && (yA === yB)
			}

			self.isZero = function(){
				return (self.getX() === 0) && (self.getY() === 0)
			}

			self.getDifference = function(otherPoint){
				var xA = self.getX()
				var yA = self.getY()
				var xB = otherPoint.getX()
				var yB = otherPoint.getY()

				return new Point(xA - xB, yA - yB)
			}

		}
	}
})();