(function() {
'use strict';

	angular
		.module('app')
		.factory('timelineFactory', Service);

	Service.inject = ['$q'];
	function Service($q) {

		var SPEED = .5;

		var ANIMATIONS = []

		var LOCAL_STATE = {
			y:200,
			x:200,
			activePoint: new Point(200, 200)
		}

		var REGIONS = [
			new Region("bill", new Point(10,10), new Point(50, 150)),
			new Region("joe", new Point(20,100), new Point(150, 250))
		]

		var service = {
			draw: draw,
			createRegion: createRegion,
		};
		
		return service;

		////////////////
		function draw(MOVE, ctx, timestamp) { 

			if(MOVE.mouseButtons.any || MOVE.isTouching){
				if(MOVE.mouseButtons.any){
					// LOCAL_STATE.y += MOVE.deltaY
					// LOCAL_STATE.x += MOVE.deltaX
					LOCAL_STATE.activePoint.adjust(MOVE.deltaX, MOVE.deltaY)
				}else if(MOVE.isTouching){
					LOCAL_STATE.activePoint.adjust(MOVE.touchDeltaX, MOVE.touchDeltaY)
					// LOCAL_STATE.y += MOVE.touchDeltaY
					// LOCAL_STATE.x += MOVE.touchDeltaX
				}
				// ANIMATIONS.push(new Anim(weirdAnim(new Point(ctx.canvas.width, LOCAL_STATE.y), new Point(0,LOCAL_STATE.y)), timestamp, 1000))
			}

			LOCAL_STATE.touchPoint = new Point(MOVE.touchX, MOVE.touchY)
			LOCAL_STATE.mousePoint = new Point(MOVE.x, MOVE.y)

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

				// if(LOCAL_STATE.mousePoint.isInRegion(region.name) && MOVE.mouseButtons.any){
				// 	color = "red"
				// }

				if(region.isPointInRegion(LOCAL_STATE.activePoint)){
					color = "red"
				}else if (region.isPointInRegion(LOCAL_STATE.touchPoint) && MOVE.isTouching){
					color = "green"
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
				// var progress = self.endPoint / timestamp
				var progress = (timestamp - self.startTime) / self.duration
				// console.log(progress, self.endTime, duration, timestamp)
				drawFn(ctx, progress)
			}
		}

		function Region(name, topLeftPoint, bottomRightPoint){
			var self = this;

			self.name = name;

			var minX = topLeftPoint.x
			var maxX = bottomRightPoint.x

			var minY = topLeftPoint.y
			var maxY = bottomRightPoint.y

			var topRightPoint = new Point(maxX, minY)
			var bottomLeftPoint = new Point(minX, maxY)

			self.isPointInRegion = function(point){
				var xP = point.x
				var yP = point.y

				var validX = (xP >= minX && xP <= maxX)
				var validY = (yP >= minY && yP <= maxY)

				return (validX && validY)
			}

			self.drawRegion = function(ctx, color){
				drawSimplePath(ctx, [topLeftPoint, topRightPoint, bottomRightPoint, bottomLeftPoint, topLeftPoint], color)
			}
		}

		function Point(x,y){
			var self = this;
			self.x = x
			self.y = y

			self.adjust = function(modX, modY){
				self.x += modX
				self.y += modY
			}

			self.clone = function(){
				return new Point(this.x, this.y)
			}

			self.isInRegion = function(regionName){
				const askedForRegion = getRegionByName(regionName)
				// console.log("REGION:", regionName, askedForRegion)
				if(askedForRegion && askedForRegion.isPointInRegion(self.clone())){
					return true
				}else{
					return false
				}
			}
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