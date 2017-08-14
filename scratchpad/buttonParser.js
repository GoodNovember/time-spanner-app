function CreateEventButtonsParser(buttonNamesArray){
	
	var buttonCount = buttonNamesArray.length
	var variationsNeeded = Math.pow(2, buttonCount)
	var seq = makeSequence(0, variationsNeeded, 1)
	var vals = seq.map(function(value){ return getBinary(buttonCount, value) })

	var map = vals.reduce(function(acc, binaryString, index){
		
		acc[index] = parseBinaryString(buttonNamesArray, binaryString)

		return acc
	}, {})

	function makeSequence(from, to, by){
		var output = []
		var start = from;
		if(start < to){
			for(start = from; start < to; start += by){
				output.push(start)
			}
		}else if(start > to){
			for(start = from; start > to; start += by){
				output.push(start)
			}
		}
		return output
	}

	function getBinary(digits, inputInt){
		var raw = (inputInt).toString(2).split("").reverse().join("")
		return padString(digits, "0", raw)
	}

	function padString(ideal, padChar, test){
		var output = test
		while(output.length < ideal){
			output = output + padChar
		}
		return output
	}

	function parseBinaryString(stringNames, input){
		var output = {}
		var hasAny = false
		var count = 0;
		for(var i = 0; i < input.length; i++){
			var name = stringNames[i]
			var test = input[i] === "1"
			output[name] = test
			if(test){
				count++;
			}
			if(!hasAny){
				hasAny = test
			}
		}
		output.any = hasAny
		output.none = !hasAny
		output.count = count
		return output
	}
	
	return function(eventButtonsValue){
		return map[eventButtonsValue]
	}
}