const			net						= require('net');
const           jspack				= require('jspack');
// const           utils               = require('utils.js')()
var				gyroData			= "";
 // const			IP						= '127.0.0.1';
const			IP						= '192.168.1.95';
//const			IP						= '192.168.10.194';
var				trameMotor		= '\x4e' + '\x41' + '\x49' + '\x4f' + '\x30' + '\x31' + '\x01' + '\x00' + '\x00' + '\x00' + '\x02' + '\x7f' + '\x7f' + '\x00' + '\x00' + '\x00' + '\x00';
var connectIndex = 0;
var intervalTime = 30;
var handledLidarData = [];

// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

function nconnect(HOST, PORT) {
	var client = new net.Socket();
	client.connect(PORT, HOST, function() {
	    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
	    connectIndex ++;
	    if(connectIndex == 3) {
	    	main();
	    	console.log('========================================================================================');
	    }
	});
	client.on('error', function() {
    	console.log('!!!!!!!!! Connection error !!!!!!!!!');
	});
	return (client);
}

function hex2a(hex) {
    var str = '';
    hex = '' + hex;
    for (var i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return hex;
}

// function nlistenGyro(client) {
// 	client.on('data', function(data) {
// 		gyroData = hex2a(data);
// 	});
// }

function nlistenLidarAndGyro(client) {
	client.on('data', function(data) {
		// console.log('receive lidar data')
		// console.log(data.length);
		// console.log(hex2a())

		// console.log(hex2a(data));
		if (data[6] == '0x0A') {
			// console.log('Gyro');
			gyroData = hex2a(data);
		}
		if (data[6] == '0x07') {
			handledLidarData = handleLidarData(data);
		}
	});
}

// function nlistenLidar(client) {
// 	client.on('data', function(data) {
// 		console.log('receive lidar data')
// 		console.log(data.length);

// 		// console.log(hex2a(data));
// 		// console.log("lydar", data)
// 		// getLidarData();
// 	});
// }

function nmove (client, trameMotor) {
	// console.log(trameMotor);
	// console.log(trameMotor[12])
	// setInterval(function(){
		// console.log('sending frame');
	client.write(trameMotor + "\n");
	// }, 30);
}


//OLD SIMU
var n_motor = nconnect(IP, 3331);
var n_lidar = nconnect(IP, 3337);
var n_gyro 	= nconnect(IP, 3340);
nlistenLidarAndGyro(n_gyro);
nlistenLidarAndGyro(n_lidar);



//NEW SIMU
//var n_motor = nconnect(IP, 5559);
//var n_lidarAndGyro = nconnect(IP, 5559);
// nlistenLidarAndGyro(n_lidarAndGyro);

//REAL ROBOT
// var n_motor = nconnect(IP, 5555);
// var n_lidarAndGyro = nconnect(IP, 5555);
// nlistenLidarAndGyro(n_lidarAndGyro);

nmove(n_motor);


var invRota, size, recentrage, angleCor, tps, saveOneRange;
var nextVirage = 'droite';
saveOneRange = -1;
angleCor = 0;
recentrage = 0;
invRota = 0;
var isPaused = false;


function main() {

	var allArrays =
		[indexArray, distanceArray, calcArray, alignArray1, alignArray2, tempArray, tempArray2];

	var indexArray = [];
	var distanceArray = [];
	var calcArray = [];
	var alignArray1 = [];
	var alignArray2 = [];
	var tempArray = [];
	var tempArray2 = [];

	var internalLidarData, oldLidarData;
	var init = 1;
	var distanceD = 0;
	var distanceG = 0;
	var degs = 0;
	var dataDistanceD = 0;
	var dataDistanceG = 0;
	

	setInterval(function() {
		if(!isPaused) {
			// Gps = Com.Gps()
			// if(all((Value == 4000)for Value in data)):
				// Virage3t()
			internalLidarData = getLidarData();
			// console.log(internalLidarData)
			// console.log(oldLidarData)
			// console.log(internalLidarData.equals(oldLidarData));
			if ((!internalLidarData.equals(oldLidarData)) && (init != 1)) {
				console.log("Obstacle Détecté")
				indexArray = [];
				distanceArray = [];
				calcArray = [];
				alignArray1 = [];
				alignArray2 = [];
				tempArray = [];
				tempArray2 = [];
				for(var i = 0; i < internalLidarData.length; i += 1) {
					if(internalLidarData[i] != oldLidarData[i]) {
						// console.log('i : ' + i);
						indexArray.push(i)
						// console.log('lidar[i] : ' + internalLidarData[i])
						distanceArray.push(internalLidarData[i])
					}
				}

				for(var i = 0; i < indexArray.length; i += 1) {
					//cos(angle) = cote adjacent / hypothenuse
					//cote adjacent = cos(angle) * hypothenuse
					var rad = Math.radians(indexArray[i]);
					var cos = Math.cos(rad);
					// console.log('Distance Array : ' + distanceArray[i])
					var calcValue = Math.round10(cos * distanceArray[i], 2);
					// console.log("DistanceLaterale : " + calcValue);
					calcArray.push(calcValue);

				}

				// console.log(calcArray)
				// console.log('distanceArray');
				// console.log(distanceArray)
				console.log('calcArray')
				console.log(calcArray)
				// console.log('indexArray')
				// console.log(indexArray)

				for(var i = 0; i < calcArray.length; i += 1) {
					for(var j = 0; j < calcArray.length; j += 1) {
						// console.log('InDoubleFor');
						if ((calcArray[i] == calcArray[j])
							&& (j != i)
							&& (calcArray[j] != 0)
							&& (calcArray[i] != 0)
							) {
							result = alignArray1.indexOf(calcArray[i]);
							// console.log("Result : " + result);
							if (result == -1) {
								alignArray1.push(calcArray[i])
								tmp = []
								tmp.push(indexArray[i])
								alignArray2.push(tmp)
							} else {
								result2 = alignArray2[result].indexOf(indexArray[i]);
								if (result2 == -1) {
									alignArray2[result].push(indexArray[i])
								}
							}
						}
					}
				}

				// console.log('alignArray2')
				// console.log(alignArray2)

				var alignArray = [];
				var maxLigne = 0;
				alignArray = removeDuplicates(alignArray1)
				size = 0

				// console.log(alignArray2)

				for(var i = 0; i < alignArray2.length; i += 1) {
					size += alignArray2[i].length;
					tempArray.push(alignArray2[i].length);
				}
				if ((alignArray2.length) != 0) {
					average = Math.floor(size / alignArray2.length);
				}
				//console.log ("Avg", average)
				// console.log('tempArray')
				// console.log(tempArray)
				if (tempArray.length > 0) {
					// maxLigne = Math.max(tempArray);
					var maxLigne = tempArray.reduce(function(a,b) {
					  return Math.max(a, b);
					});
				}
				tempArray = [];
				w = 1;
				distanceD = 0;
				distanceG = 0;

				console.log('ALIGN ARRAY 1');
				console.log(alignArray1);

				console.log('ALIGN ARRAY 2');
				console.log(alignArray2);

				while (w == 1) {
					w = 0
					for (var i = 0; i < alignArray2.length; i += 1) {
						//console.log ("Size : ", len(lstAlign2[j]), ", IT : ", j)
						if (alignArray2[i].length < average) {
							// console.log('SPLICING I : ' + i)
							alignArray1.splice(i, 1);
							alignArray2.splice(i, 1);
							w = 1;
							break;
						}
					}
				}


				console.log('ALIGN ARRAY 1 AFTER SPLICING');
				console.log(alignArray1);

				console.log('ALIGN ARRAY 2 AFTER SPLICING');
				console.log(alignArray2);


				alignArray1.push(4000);
				alignArray1.push(-4000);
				//Correction Trajectoire

				for(index in alignArray1) {
					var value = alignArray1[index];
					if(value < 0) {
						tempArray.push(Math.abs(value));
						// console.log('existDroite');
					} else if (value > 0) {
						tempArray2.push(value);
						// console.log('existGauche')
					}
				}

				console.log('HANDLING DISTANCE DROITE');
				console.log(tempArray)
				// distanceD = Math.min(tempArray);
				var distanceD = tempArray.reduce(function(a,b) {
				  return Math.min(a, b);
				});

				console.log('distanceD : ' + distanceD);

				if (distanceD > 1000) {
					distanceD = 0;
				}

				console.log('HANDLING DISTANCE GAUCHE');
				console.log(tempArray2)

				// distanceG = Math.min(tempArray2)
				var distanceG = tempArray2.reduce(function(a,b) {
				  return Math.min(a, b);
				});

				console.log('distanceG : ' + distanceG)

				if (distanceG > 1000) {
					distanceG = 0;
				}
				if ((distanceD != 0) && (distanceG != 0)) {
					invRota = 0;
				}

				console.log("Droite : " + distanceD)
				console.log("Gauche : " + distanceG)

				if((distanceD == 0) && (distanceG>0) && (distanceG<700)) {
					console.log("NOLIGNEDROITE");
					distanceD = distanceG;
					if(invRota == 1) {
						invRota = 2;
					}
					if(saveOneRange == -1) {
						saveOneRange = distanceG;
					} else {
						distanceD = saveOneRange;
					}
				}

				if((distanceG == 0) && (distanceD > 0) && (distanceD < 700)) {
					console.log("NOLIGNEGAUCHE")
					distanceG = distanceD;
					if(invRota == 1) {
						invRota = 2;
					}
					if(saveOneRange == -1) {
						saveOneRange = distanceD;
					}
					else {
						distanceG = saveOneRange;
					}
				}


				//Sequence d'instruction Motors

				console.log("dataDistanceD : " + dataDistanceD)
				console.log("dataDistanceG : " + dataDistanceG)
				console.log("maxLigne : " + maxLigne)
				console.log("recentrage : " + recentrage)
				console.log("angleCor : " + angleCor)

				if ((recentrage == 1) && (maxLigne >= 12)) {
					recentrage = 0
				}
				if ((recentrage == 1) && (maxLigne < 12)) {
					console.log("Recentrage aprés virage")
					// for(var i = 0; i < 10; i += 1) {
						var i = 0;
						var newInterval = setInterval(function() {
							if((i >= 7)) {
								clearInterval(newInterval);
								endFunction();
							}
							if(nextVirage === 'droite') {
								turnForwardLeft();
							} else {
								turnForwardRight();
							}
							i++;
						}, intervalTime);		
					// }
				} else if (((distanceD + distanceG) / 2) > distanceG) {
					console.log("Correction vers la droite");
					var i = 0;
					var newInterval = setInterval(function() {
						if(i >= 3) {
							clearInterval(newInterval);
							endFunction();
						} 
						turnForwardRight();
						angleCor = angleCor + 0.3;
						i++;
					}, intervalTime);

				} else if (((distanceD + distanceG) / 2) > distanceD) {
					console.log("Correction vers la gauche");
					var i = 0;
					var newInterval = setInterval(function() {
						if(i >= 3) {
							clearInterval(newInterval);
							endFunction();
						} 
						turnForwardLeft();
						angleCor = angleCor - 0.3;
						i++;
					}, intervalTime);
				} else if (distanceD == distanceG) {
					console.log("Le robot semble au milieu")
					endFunction();
				} else {
					console.log("Probleme de correction de trajectoire")
					console.log("AAAAAAAAAAAHHHHHHHHHHHHHAAAAAAAAAAHAHAHHAHAHAHAHAHAHAHHAHAHAHAHAHAHHAHAHAHAHAHAHHAHAHAHAHAHHAHAHAHAHAHHAHAAHAH")
					endFunction();
				}

				function endFunction() {
					console.log('dataDistanceD : ' + dataDistanceD );
					console.log('dataDistanceG : ' + dataDistanceG );
					dataDistanceD = distanceD;
					dataDistanceG = distanceG;
					console.log('NewdataDistanceD : ' + dataDistanceD );
					console.log('NewdataDistanceG : ' + dataDistanceG );
					console.log('invRota : ' + invRota);
					console.log('nextVirage : ' + nextVirage);
					if ((distanceD == 0) && (distanceG == 0)) {
						console.log("Pas de ligne d'avancement detecté")
						if(recentrage == 0) {
							//Inversion de la Rotation
							if(invRota == 2) {
								if(nextVirage == 'droite') {
									newNextVirage = 'gauche';
								} else if (nextVirage == 'gauche') {
									newNextVirage = 'droite';
								}
								setNextVirage(newNextVirage);
							}
							//Rotation
							console.log('VEUT FAIRE Virage3t')
							isPaused = true;
							Virage3t(nextVirage);
						}
					} else if (indexArray.every(isOverNinety)) {
						// console.log(indexArray)
						console.log("Obstacle uniquement sur la droite")
						moveForward()
					} else if (indexArray.every(isBelowNinety)) {
						// console.log(indexArray)
						console.log("Obstacle uniquement sur la gauche")
						moveForward()
					} else if (indexArray.every(isBetweenSixtyAndOneTwenty)) {
						console.log("Obstacle sur trajectoire")
					} else {
						moveForward()
						// Gpstemp = Gps
					}					
				}




			// else if(Gps == Gpstemp):
				// console.log("Robot embourbé, tentative de désembourbage")
				// moveForward()
				// Gps = Com.Gps()
				// if(Gps == Gpstemp):
					// Com.Reculer()
					// Gps = Com.Gps()
					// if(Gps == Gpstemp):
						// console.log("Echec du désembourbage, SOS SOS SOS")
			} else {
				moveForward();
				console.log("Action Par Default");
				init = 0;
				// Gpstemp = Gps;
				// datatemp = data;
			}
			oldLidarData = internalLidarData;
		}
	}, intervalTime);
	return 0

}

function isBelowNinety(currentValue) {
	return currentValue < 90;
}

function isOverNinety(currentValue) {
	return currentValue > 90;
}

function isBetweenSixtyAndOneTwenty(currentValue) {
	return (currentValue > 60) && (currentValue < 120);
}

function Virage3t() {
	console.log("Init Virage3t")
	//Prise de distance
	// console.log("debut de prise de distance")
	function priseDeDistance() {
		var i = 0;
		var newInterval = setInterval(function() {
			if(i >= 75) {
				clearInterval(newInterval);
				rotation90Avant();
			}
			moveForward()
			i++;
		}, intervalTime)		
	}

	function rotation90Avant() {
		var angle = 0;
		var degs = 0;
		var newInterval = setInterval(function() {
			if(nextVirage == 'droite') {
				turnForwardRight();
			} else {
				turnForwardLeft();
			}
			degs = getGyroData();
			angle = angle + (degs);
			console.log("Angle : " + angle);
			console.log("angleCor : " + angleCor);
			if(!(angle < (35))) {
				clearInterval(newInterval);
				rotation90Arriere();
			}
		}, intervalTime);		
	}

	function rotation90Arriere() {
		var angle = 0;
		var degs = 0;
		var newInterval = setInterval(function() {
			if(nextVirage == 'droite') {
				turnBackWardLeft();
			} else {
				turnBackWardRight();
			}
			degs = getGyroData();
			angle = angle + (degs);
			console.log("Angle : " + angle);
			if(!(angle < 20)) {
				clearInterval(newInterval);
				endVirage3T();
			}
		}, intervalTime)		
	}

	function endVirage3T() {
		if(nextVirage == 'droite') {
			var newNextVirage = 'gauche';
		} else {
			var newNextVirage = 'droite';
		}

		console.log('nextVirage at end 3t : ' + newNextVirage);

		recentrage = 1;
		invRota = 1;
		saveOneRange = -1;
		isPaused = false;
		setNextVirage(newNextVirage);		
	}

	priseDeDistance();

}

function setNextVirage(newNextVirage) {
	console.log('Set new virage to : ' + newNextVirage);
	console.log('Old nextVirage was : ' + nextVirage);
	nextVirage = newNextVirage;
}

function moveForward() {
	console.log('moveForward');
	var trameMotor = '\x4e' + '\x41' + '\x49' + '\x4f' + '\x30' + '\x31' + '\x01' + '\x00' + '\x00' + '\x00' + '\x02' + '\x7f' + '\x7f' + '\x00' + '\x00' + '\x00' + '\x00';
	nmove(n_motor, trameMotor);
}

function handleLidarData(lidarData) {
	var tmp = lidarData.slice(103, 463);
	lidarData = tmp;
	var ndata = [];
	for(var i = 0; i < lidarData.length; i += 2) {
		test = [lidarData[i]];
		test2 = [lidarData[i+1]];
		bytes = test.concat(test2);
		var ntest = jspack.jspack.Unpack('H', bytes);
		ndata.push(ntest[0]);
	}
	return ndata;
}

function getLidarData() {
	return handledLidarData;
}

function getGyroData() {
  console.log('getGyroData');
  // console.log(gyroData);

  	var test2 = [gyroData.slice(16, 17)];
  	var test = [gyroData.slice(15, 16)];
  	bytes = test.concat(test2);
	var ntest = jspack.jspack.Unpack('H', bytes);
	ntest = Math.abs(ntest[0] * 0.02/28);
	if((ntest<0.4) && (ntest>0.2)){
		return ntest;
	} else {
		return 0.2;
	}
}

function turnBackWardLeft() {
	console.log('turnBackWardLeft')
	var trameMotor = '\x4e' + '\x41' + '\x49' + '\x4f' + '\x30' + '\x31' + '\x01' + '\x00' + '\x00' + '\x00' + '\x02' + '\xc1' + '\x81' + '\x00' + '\x00' + '\x00' + '\x00';
	nmove(n_motor, trameMotor);
}

function turnBackWardRight() {
	console.log('turnBackWardRight')
	var trameMotor = '\x4e' + '\x41' + '\x49' + '\x4f' + '\x30' + '\x31' + '\x01' + '\x00' + '\x00' + '\x00' + '\x02' + '\x81' + '\xc1' + '\x00' + '\x00' + '\x00' + '\x00';
	nmove(n_motor, trameMotor);
}

function turnForwardRight() {
	console.log('turnForwardRight')
	var trameMotor = '\x4e' + '\x41' + '\x49' + '\x4f' + '\x30' + '\x31' + '\x01' + '\x00' + '\x00' + '\x00' + '\x02' + '\x7f' + '\x3f' + '\x00' + '\x00' + '\x00' + '\x00';
	nmove(n_motor, trameMotor);
}

function turnForwardLeft() {
	console.log('turnForwardLeft')
	var trameMotor = '\x4e' + '\x41' + '\x49' + '\x4f' + '\x30' + '\x31' + '\x01' + '\x00' + '\x00' + '\x00' + '\x02' + '\x3f' + '\x7f' + '\x00' + '\x00' + '\x00' + '\x00';
	nmove(n_motor, trameMotor);
}


function removeDuplicates(array) {
	var result = [];
	array.forEach(function(item) {
	     if(result.indexOf(item) < 0) {
	         result.push(item);
	     }
	});
    return result;
}

// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});


(function() {
  /**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */
  function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }
})();