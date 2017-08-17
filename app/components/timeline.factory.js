(function() {
'use strict';

	angular
		.module('app')
		.factory('timelineFactory', Service);

	Service.inject = ['$q', "geometryFactory"];
	function Service($q, geometryFactory) {

		var SPEED = .5;

		var ANIMATIONS = []

		var LOCAL_STATE = {
			y:200,
			x:200,
			activePoint: new geometryFactory.Point(200, 200),
			activeRegions: [],
		}

		var REGIONS = [
			new Region("bill", new geometryFactory.Point(10,10), new geometryFactory.Point(50, 150)),
			new Region("joe", new geometryFactory.Point(20,100), new geometryFactory.Point(150, 250))
		]

		var service = {
			draw: draw,
			createRegion: createRegion,
		};
		
		return service;

		////////////////
		function draw(MOVE, ctx, timestamp) { 

			var movableRegion = "bill"

			if(MOVE.mouseButtons.any || MOVE.isTouching){
				if(MOVE.mouseButtons.any){
					LOCAL_STATE.activePoint.adjustByPoint(MOVE.mouseDelta)
				}
			}

			LOCAL_STATE.touchPoint = new geometryFactory.Point(MOVE.touchX, MOVE.touchY)
			LOCAL_STATE.mousePoint = MOVE.mousePoint

			if(MOVE.mouseButtons.left && LOCAL_STATE.activeRegions.length === 0){
				LOCAL_STATE.activeRegions = getIncludedRegions(LOCAL_STATE.mousePoint)
			}
			if(MOVE.mouseButtons.left === false){
				LOCAL_STATE.activeRegions = []
			}

			LOCAL_STATE.activeRegions.map(function(region){
				region.adjustByPoint(MOVE.mouseDelta)
			})

			clear(ctx)

			drawFilledSquare(ctx, LOCAL_STATE.activePoint, 10)

			ANIMATIONS = ANIMATIONS.reduce(function(acc, anim){

				anim.play(ctx, timestamp)

				if(anim.endTime > timestamp){
					acc.push(anim)
				}

				return acc

			},[])

			REGIONS.map(function(region){ 
				var color = "black"

				if(region.isPointInRegion(LOCAL_STATE.activePoint)){
					color = "red"
				}else if (region.isPointInRegion(LOCAL_STATE.mousePoint) && MOVE.mouseButtons.any){
					color = "pink"
				}else if (region.isPointInRegion(LOCAL_STATE.mousePoint)){
					color = "yellow"
				}
				region.drawRegion(ctx, color) 
			})
		}

		function clear(ctx){
			ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height)
		}

		function weirdAnim(startPoint, endPoint){
			var lerpX = LERP(startPoint.x, endPoint.x)
			var lerpY = LERP(startPoint.y, endPoint.y)
			return function(ctx, progress){
				ctx.beginPath()
				ctx.rect(lerpX(progress), lerpY(progress), 10, 10)
				ctx.fill()
			}
		}

		function Anim(drawFn, timestamp, duration){
			var self = this;
			self.startTime = timestamp
			self.duration = duration
			self.endTime = self.startTime + duration
			self.play = function(ctx, timestamp){
				var progress = (timestamp - self.startTime) / self.duration
				drawFn(ctx, progress)
			}
		}

		function Region(name, pointA, pointB){
			var self = this;

			self.name = name;

			var pA = pointA.clone()
			var pB = pointB.clone()

			function getMinX(){
				return Math.min(pA.x, pB.x)
			}

			function getMaxX(){
				return Math.max(pA.x, pB.x)
			}

			function getMinY(){
				return Math.min(pA.y, pB.y)
			}

			function getMaxY(){
				return Math.max(pA.y, pB.y)
			}

			self.isPointInRegion = function(point){
				var pX = point.x
				var pY = point.y

				var isValidX = (pX >= getMinX() && pX <= getMaxX())
				var isValidY = (pY >= getMinY() && pY <= getMaxY())

				return (isValidX && isValidY)
			}

			self.drawRegion = function(ctx, color){

				var minX = getMinX()
				var minY = getMinY()

				var maxX = getMaxX()
				var maxY = getMaxY()

				var topLeft = new geometryFactory.Point(minX, minY)
				var topRight = new geometryFactory.Point(maxX, minY)
				var bottomLeft = new geometryFactory.Point(minX, maxY)
				var bottomRight = new geometryFactory.Point(maxX, maxY)

				drawSimplePath(ctx, [topLeft, topRight, bottomRight, bottomLeft, topLeft], color)
			}

			self.adjust = function(x,y){
				pA.adjust(x,y)
				pB.adjust(x,y)
			}
			self.adjustByPoint = function(otherPoint){
				pA.adjustByPoint(otherPoint)
				pB.adjustByPoint(otherPoint)
			}
		}

		function isPointInRegion(point, regionName){
			var region = getRegionByName(regionName)

			if(region && region.isPointInRegion(point.clone())){
				return true
			}else{
				return false
			}
		}

		function getIncludedRegions(point){
			return REGIONS.reduce(function(acc, region){
				if(region.isPointInRegion(point.clone())){
					acc.push(region)
				}
				return acc
			},[])
		}

		function getRegionByName(regionName){
			return REGIONS.reduce(function(acc, region){
				if(region.name === regionName && acc === null){
					acc = region
				}
				return acc
			},null)
		}

		function drawSimplePath(ctx, pointArray, color){
			pointArray.map((point, index)=>{
				var isFirst = index === 0
				var isLast = (index + 1) === pointArray.length

				if(isFirst){
					ctx.beginPath()
					ctx.strokeStyle = color || "black"
					ctx.moveTo(point.x + .5, point.y + .5)
				} else if(isLast){
					ctx.lineTo(point.x + .5, point.y + .5)
					ctx.stroke()
				}else{
					ctx.lineTo(point.x + .5, point.y + .5)
				}
			})
		}

		function drawFilledSquare(ctx, point, size){
			ctx.beginPath()
			ctx.rect(point.x - (size/2) + .5, point.y - (size/2) + .5, size, size)
			ctx.fill()
		}

		function LERP(fromValue, toValue){
			return function(progress){
				return (fromValue * (1.0 - progress)) + (toValue * progress)
			}
		}

		function getDPR(){
			return window.devicePixelRatio || 1
		}

		function createRegion(name, topLeftPoint, bottomRightPoint){
			var region = new Region(name, topLeftPoint, bottomRightPoint)
			REGIONS.push(region)
		}
	}
})();