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

	tispTimelineCtrl.$inject = ["$element", "timelineFactory", "$scope"];
	function tispTimelineCtrl($element, timelineFactory, $scope){
		var $ctrl = this;

		var MOVEMENT_STATE = {
			deltaX:0,
			deltaY:0,
			lastX:0,
			lastY:0,
			wasTouching:false,
			isTouching:false,
			isMoving:false,
			x:0,
			y:0,
			lastTouchX:0,
			lastTouchY:0,
			touchStartX:0,
			touchStartY:0,
			touchX:0,
			touchY:0,
			touchDeltaX:0,
			touchDeltaY:0,
			isMouseCaptured:false,
		}
		
		var dpr = window.devicePixelRatio || 1

		var buttonHandler = makeButtonHandler(["left", "right", "middle"])

		$ctrl.$onInit = init;
		$ctrl.heartbeatEnabled = false;
		$ctrl.MOVEMENT_STATE = MOVEMENT_STATE

		$ctrl.startHeartbeat = function(){
			$ctrl.heartbeatEnabled = true
			requestAnimationFrame(heartbeat)
		}
		$ctrl.stopHeartbeat = function(){
			$ctrl.heartbeatEnabled = false
		}

		$ctrl.mouseMove = function(e){
			handleMouseEvent(e)
			MOVEMENT_STATE.isMouseCaptured = true
		}

		$ctrl.mouseDown = function(e){
			handleMouseEvent(e)
		}

		$ctrl.mouseUp = function(e){
			handleMouseEvent(e)
		}

		$ctrl.mouseEnter = function(e){
			handleMouseEvent(e)
			MOVEMENT_STATE.isMouseCaptured = true;
		}

		$ctrl.mouseLeave = function(e){
			handleMouseEvent(e)
			MOVEMENT_STATE.isMouseCaptured = false;
		}

		// $element.on("contextmenu", function(e){
		// 	e.preventDefault()
		// })

		$element.on("touchstart", function(e){
			handleTouchEvent(e)
			if(MOVEMENT_STATE.wasTouching == false){
				MOVEMENT_STATE.touchStartY = e.touches[0].clientY * dpr
				MOVEMENT_STATE.touchStartX = e.touches[0].clientX * dpr
			}
			// $scope.apply()
		})

		$element.on("touchmove", function(e){
			handleTouchEvent(e)
			// $scope.apply()
		})

		$element.on("touchend", function(e){
			handleTouchEvent(e)
			// $scope.apply()
		})

		function handleMouseEvent(e){
			MOVEMENT_STATE.mouseButtons = buttonHandler(e.buttons)
			MOVEMENT_STATE.x = e.x * dpr
			MOVEMENT_STATE.y = e.y * dpr
		}
		function handleTouchEvent(e){
			
			MOVEMENT_STATE.isTouching = e.touches.length > 0

			if(MOVEMENT_STATE.isTouching){
				MOVEMENT_STATE.touchX = e.touches[0].clientX * dpr
				MOVEMENT_STATE.touchY = e.touches[0].clientY * dpr
			}

			$scope.$apply() //  the touch events need to trigger Angular manually, it seems
		}

		function makeButtonHandler(buttonNameArray){

			function padString(ideal, input){
				var output = input
				while(output.length < ideal){
					output = "0" + output
				}
				return output
			}

			function parse(buttonNames, input){
				var output = {}
				var anyButtonWasPressed = false
				for(var i = 0; i < input.length; i++){
					output[buttonNames[i]] = input[i] === "1"
					if(!anyButtonWasPressed){
						anyButtonWasPressed = input[i] === "1"
					}
				}
				if(anyButtonWasPressed){
					output.any = true
				}else{
					output.any = false
				}
				return output
			}

			var buttonNamesInOrder = buttonNameArray.reduce(function(acc,_,index, array){
				// this is a non-mutating reverser.
				var length = array.length;
				var newIndex = length - index - 1;
				acc.push(array[newIndex])
				return acc;
			},[])
			var buttonCount = buttonNamesInOrder.length
			var buttonValues = buttonNamesInOrder.reduce(function(acc, _, index){
				if(index === 0){
					acc.push(1)
				}else{
					var prevValue = acc[index -1]
					acc.push(prevValue * 2)
				}
				return acc
			},[])
			var largestValue = buttonValues[buttonValues.length -1]
			var maxGenValue = largestValue * 2
			var rawPossibilities = []

			for(var i = 0; i < maxGenValue; i++){
				var rawBinary = i.toString(2)
				var paddedBinary = padString(buttonCount, rawBinary)
				// console.log(paddedBinary)
				rawPossibilities.push(paddedBinary)
			}

			var possibilities = rawPossibilities.map(function(rawBinaryString){
				return parse(buttonNamesInOrder, rawBinaryString)
			})

			return function(buttons){
				// console.log(buttons)
				return possibilities[buttons]
			}

		}

		$ctrl.ctxBinder = function(ctx){
			// console.log("Got CTX:", ctx)
			$ctrl.ctx = ctx;
			$ctrl.startHeartbeat()
		}

		function init(){
			console.log("init component tispTimeline");
			MOVEMENT_STATE.mouseButtons = buttonHandler(0)
		}
		// end init
		
		function heartbeat(timestamp){
			var sized = false
			if($ctrl.ctx){
				// console.log("Blip!")
				sized = sizeCanvas($ctrl.ctx)
			}

			// BEGIN PRE-DRAW SETUP

			if(MOVEMENT_STATE.wasTouching === false && MOVEMENT_STATE.isTouching){
				MOVEMENT_STATE.lastTouchX = MOVEMENT_STATE.touchStartX
				MOVEMENT_STATE.lastTouchY = MOVEMENT_STATE.touchStartY
			}

			var newDeltaX = MOVEMENT_STATE.x - MOVEMENT_STATE.lastX
			var newDeltaY = MOVEMENT_STATE.y - MOVEMENT_STATE.lastY

			var newTouchDeltaX = MOVEMENT_STATE.touchX - MOVEMENT_STATE.lastTouchX
			var newTouchDeltaY = MOVEMENT_STATE.touchY - MOVEMENT_STATE.lastTouchY

			if(MOVEMENT_STATE.x === MOVEMENT_STATE.lastX){
				newDeltaX = 0
			}
			if(MOVEMENT_STATE.y === MOVEMENT_STATE.lastY){
				newDeltaY = 0
			}
			if(MOVEMENT_STATE.touchX === MOVEMENT_STATE.lastTouchX){
				newTouchDeltaX = 0
			}
			if(MOVEMENT_STATE.touchY === MOVEMENT_STATE.lastTouchY){
				newTouchDeltaY = 0
			}

			MOVEMENT_STATE.deltaX = newDeltaX
			MOVEMENT_STATE.deltaY = newDeltaY

			MOVEMENT_STATE.touchDeltaX = newTouchDeltaX
			MOVEMENT_STATE.touchDeltaY = newTouchDeltaY

			// END PRE-DRAW SETUP

			draw(timestamp)

			// BEGIN POST-DRAW CLEANUP

			MOVEMENT_STATE.wasTouching = MOVEMENT_STATE.isTouching

			MOVEMENT_STATE.lastX = MOVEMENT_STATE.x
			MOVEMENT_STATE.lastY = MOVEMENT_STATE.y

			MOVEMENT_STATE.lastTouchX = MOVEMENT_STATE.touchX
			MOVEMENT_STATE.lastTouchY = MOVEMENT_STATE.touchY

			if(MOVEMENT_STATE.deltaX !== 0 || MOVEMENT_STATE.deltaY !== 0){
				MOVEMENT_STATE.isMoving = true
			}else{
				MOVEMENT_STATE.isMoving = false
			}

			if(MOVEMENT_STATE.isMoving == false){
				if(MOVEMENT_STATE.touchDeltaX !== 0 || MOVEMENT_STATE.touchDeltaY !== 0){
					MOVEMENT_STATE.isMoving = true
				}else{
					MOVEMENT_STATE.isMoving = false
				}
			}

			// END POST-DRAW CLEANUP

			if($ctrl.heartbeatEnabled){
				requestAnimationFrame(heartbeat)
			}
		}
		
		function draw(timestamp){
			timelineFactory.draw(MOVEMENT_STATE, $ctrl.ctx, timestamp)
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