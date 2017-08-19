(function() {
'use strict';

	angular
		.module('app')
		.factory('movementFactory', movementFactory);

	movementFactory.inject = ['$q', 'geometryFactory'];
	function movementFactory($q, geometryFactory) {

		var buttonHandler = makeButtonHandler(["left", "right", "middle", "fourth", "fifth"])

		var MOVE_STATE = {
			mousePoint: new geometryFactory.Point(0,0),
			lastMousePoint: new geometryFactory.Point(0,0),
			mouseButtons: buttonHandler(0),
			activePoints:{},
			isMouseActive:false,
			isMouseCaptured:false,
			isTouchActive:false,
		}

		var service = {
			bindTo:bindTo,
			getState:getState,
			update:update,
		};
		return service;

		////////////////
		function bindTo(element) { 

			var bindings = {
				"mouseenter":onMouseEnter,
				"mouseleave":onMouseLeave,
				"mousedown":onMouseDown,
				"mouseup":onMouseUp,
				"mouseleave":onMouseLeave,
				"mousemove":onMouseMove,
				"touchstart":onTouchStart,
				"touchend":onTouchEnd,
				"touchmove":onTouchMove
			}

			Object.keys(bindings).map(function(key){
				var eventName = key
				var handlerFn = bindings[key]
				element.on(eventName, handlerFn)
			})

			function onMouseEnter(event){
				handleCommonMouseEvent(event)
				MOVE_STATE.isMouseCaptured = true;
			}

			function onMouseLeave(event){
				handleCommonMouseEvent(event)
			}

			function onMouseDown(event){
				handleCommonMouseEvent(event)
			}

			function onMouseUp(event){
				handleCommonMouseEvent(event)
			}

			function onMouseMove(event){
				handleCommonMouseEvent(event)
			}

			function onTouchStart(event){
				handleCommonTouchEvent(event)
				MOVE_STATE.isTouchActive = true
			}

			function onTouchEnd(event){
				handleCommonTouchEvent(event)
				if(event.touches.length == 0){
					MOVE_STATE.isTouchActive = false
				}
			}

			function onTouchMove(event){
				handleCommonTouchEvent(event)
			}

			function handleCommonMouseEvent(event){
				MOVE_STATE.mouseButtons = buttonHandler(event.buttons)
				var x = event.x * getDPR()
				var y = event.y * getDPR()
				MOVE_STATE.mousePoint = new geometryFactory.Point(x, y)
			}
			function handleCommonTouchEvent(event){

			}

		}

		function getState(){
			return MOVE_STATE
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

		function update(timestamp){

			MOVE_STATE.timestamp = timestamp
			MOVE_STATE.mouseDelta = MOVE_STATE.mousePoint.getDifference(MOVE_STATE.lastMousePoint)
			MOVE_STATE.lastMousePoint = MOVE_STATE.mousePoint.clone()

			if(MOVE_STATE.mouseDelta.isZero() == false){
				MOVE_STATE.isMoving = true
			}else{
				MOVE_STATE.isMoving = false
			}

		}

		function getDPR(){
			return window.devicePixelRatio || 1
		}
	}
})();