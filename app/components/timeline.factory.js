(function() {
'use strict';

	angular
		.module('app')
		.factory('timelineFactory', Service);

	Service.inject = ['$q', "geometryFactory", 'timeKeeperFactory'];
	function Service($q, geometryFactory, timeKeeperFactory) {

		var SPEED = .5;

		var dragingRegionName = "dragon"
		var timeRegionName = "timelord"

		var ANIMATIONS = []

		var LOCAL_STATE = {
			activePoint: new geometryFactory.Point(200, 200),
			mousePoint: new geometryFactory.Point(0,0),
			activeRegions: [],
			hasStartedNewEvent:false,
			newEventStartPoint: new geometryFactory.Point(0.0),
			newEvents:[]
		}

		var REGIONS = [
			new Region(dragingRegionName, new geometryFactory.Point(0,0), new geometryFactory.Point(50, 150)),
			new Region(timeRegionName, new geometryFactory.Point(50,0), new geometryFactory.Point(100, 50)),
		]

		var EVENT_REGIONS = [
			new Region("abba", new geometryFactory.Point(52,2), new geometryFactory.Point(101, 150))
		]

		var startTime = timeKeeperFactory.startTime
		var lastTime = startTime
		var timeDiff = 0
		var timeNow = timeKeeperFactory.getNow()
		var timeSinceStart = 0

		var service = {
			draw: draw,
			createRegion: createRegion,
		};


		return service;

		////////////////
		function draw(MOVE, VIEWPORT, ctx, timestamp) { 

			timeNow = timeKeeperFactory.getNow()
			timeSinceStart = timeNow - startTime
			timeDiff = timeNow - lastTime

			// console.log("time:")

			var dragRegion = getRegionByName(dragingRegionName)
			var isClickingDragon = dragRegion.isPointInRegion(MOVE.mousePoint) && MOVE.mouseButtons.left

			var timeRegion = getRegionByName(timeRegionName)
			var isClickingTimeRegion = timeRegion.isPointInRegion(MOVE.mousePoint) && MOVE.mouseButtons.left

			if(VIEWPORT.wasSized){
				dragRegion.setHeight(VIEWPORT.maxPoint.getY() -1)
				timeRegion.setHeight(VIEWPORT.maxPoint.getY() -1).setWidth(VIEWPORT.maxPoint.getX() -1)
			}

			if (isClickingTimeRegion){
				if(LOCAL_STATE.hasStartedNewEvent == false){
					var newRegion = new Region("new-event", MOVE.mousePoint.clone(), MOVE.mousePoint.clone().adjustX(30))
					LOCAL_STATE.newEvents.push( newRegion )
					LOCAL_STATE.hasStartedNewEvent = true
				}
			}else{
				LOCAL_STATE.hasStartedNewEvent = false
			}

			LOCAL_STATE.newEvents = LOCAL_STATE.newEvents.reduce(function(acc, region){
				if(isClickingTimeRegion === false){
					EVENT_REGIONS.push(region)
					
				}else{
					region.setHeight(MOVE.mousePoint.getY())
					acc.push(region)
				}
				return acc
			},[])


			if(MOVE.mouseButtons.any || MOVE.isTouching){
				if(MOVE.mouseButtons.any && isClickingDragon){
					LOCAL_STATE.activePoint.adjustByPoint(MOVE.mouseDelta)
				}
			}

			LOCAL_STATE.touchPoint = new geometryFactory.Point(MOVE.touchX, MOVE.touchY)
			if(MOVE.mousePoint){
				LOCAL_STATE.mousePoint = MOVE.mousePoint
			}

			if(MOVE.mouseButtons.left && LOCAL_STATE.activeRegions.length === 0){
				LOCAL_STATE.activeRegions = getIncludedRegions(LOCAL_STATE.mousePoint)
			}
			if(MOVE.mouseButtons.left === false){
				LOCAL_STATE.activeRegions = []
			}

			// LOCAL_STATE.activeRegions.map(function(region){
			// 	region.adjustYByPoint(MOVE.mouseDelta)
			// })

			EVENT_REGIONS.map(function(region){
				if(MOVE.mouseDelta && MOVE.mouseButtons.left && isClickingDragon){
					region.adjustYByPoint(MOVE.mouseDelta)
				}
			})

			clear(ctx)

			drawHorizontalLineAtY(ctx, LOCAL_STATE.activePoint.getY() + (timeNow / 1000))

			drawHorizontalLineAtY(ctx, LOCAL_STATE.mousePoint.getY(), "Label: " + (LOCAL_STATE.mousePoint.getY() - LOCAL_STATE.activePoint.getY()))

			ANIMATIONS = ANIMATIONS.reduce(function(acc, anim){

				anim.play(ctx, timestamp)

				if(anim.endTime > timestamp){
					acc.push(anim)
				}

				return acc

			},[])

			REGIONS.map(function(region){ region.drawRegion(ctx, "black") })

			EVENT_REGIONS.map(function(region){
				var color = "black"
				if(region.name !== dragingRegionName && region.name !== timeRegionName){
					if (region.isPointInRegion(LOCAL_STATE.mousePoint) && MOVE.mouseButtons.any){
						color = "pink"
					}else if (region.isPointInRegion(LOCAL_STATE.mousePoint)){
						color = "red"
					}
				}
				region.drawRegion(ctx, color)
			})

			LOCAL_STATE.newEvents.map(function(region){ region.drawRegion(ctx, "red") })


			lastTime = timeNow
		}

		function clear(ctx){
			ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height)
		}

		function weirdAnim(startPoint, endPoint){
			var lerpX = LERP(startPoint.getX(), endPoint.getX())
			var lerpY = LERP(startPoint.getY(), endPoint.getY())
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
				return Math.min(pA.getX(), pB.getX())
			}

			function getMaxX(){
				return Math.max(pA.getX(), pB.getX())
			}

			function getMinY(){
				return Math.min(pA.getY(), pB.getY())
			}

			function getMaxY(){
				return Math.max(pA.getY(), pB.getY())
			}

			function getMaxYPoint(){
				if(pA.getY() >= pB.getY()){
					return pA
				}else{
					return pB
				}
			}

			function getMaxXPoint(){
				if(pA.getX() >= pB.getX()){
					return pA
				}else{
					return pB
				}
			}

			function getMinYPoint(){
				if(pA.getY() <= pB.getY()){
					return pA
				}else{
					return pB
				}
			}

			function getMinXPoint(){
				if(pA.getX() <= pB.getX()){
					return pA
				}else{
					return pB
				}
			}

			self.isPointInRegion = function(point){
				var pX = point.getX()
				var pY = point.getY()

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
				return self
			}
			self.adjustXByPoint = function(otherPoint){
				pA.adjustXByPoint(otherPoint)
				pB.adjustXByPoint(otherPoint)
				return self
			}
			self.adjustYByPoint = function(otherPoint){
				pA.adjustYByPoint(otherPoint)
				pB.adjustYByPoint(otherPoint)
				return self
			}

			self.setHeight = function(newHeight){
				if(newHeight > getMaxY() || newHeight > getMinY()){
					getMaxYPoint().setY(newHeight)
				}
				if(newHeight < getMinY()){
					getMinYPoint().setY(newHeight)
				}
				return self
			}

			self.setWidth = function(newWidth){
				if(newWidth > getMaxX()){
					getMaxXPoint().setX(newWidth)
				}else if(newWidth < getMinX()){
					getMinXPoint().setX(newWidth)
				}
				return self
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
					ctx.moveTo(point.getX() + .5, point.getY() + .5)
				} else if(isLast){
					ctx.lineTo(point.getX() + .5, point.getY() + .5)
					ctx.stroke()
				}else{
					ctx.lineTo(point.getX() + .5, point.getY() + .5)
				}
			})
		}

		function drawFilledSquare(ctx, point, size){
			ctx.beginPath()
			ctx.rect(point.getX() - (size/2) + .5, point.getY() - (size/2) + .5, size, size)
			ctx.fill()
		}

		function drawHorizontalLineAtY(ctx, y, label){

			var myY = y + .5

			ctx.beginPath()
			ctx.strokeStyle = "black"
			ctx.moveTo(0, myY)
			ctx.lineTo(ctx.canvas.width, myY)
			if(label){
				var labelLengh = ctx.measureText(label + " ").width
				ctx.fillText(label,ctx.canvas.width - labelLengh, myY - 2)
			}
			ctx.stroke()
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