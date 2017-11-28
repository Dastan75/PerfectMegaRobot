const			net						= require('net');
const           jspack				= require('jspack');
var				lidarData			= "";
var				gyroData			= "";
 const			IP						= '127.0.0.1';
// const			IP						= '192.168.1.95';
//const			IP						= '192.168.10.194';
var				trameMotor		= '\x4e' + '\x41' + '\x49' + '\x4f' + '\x30' + '\x31' + '\x01' + '\x00' + '\x00' + '\x00' + '\x02' + '\x7f' + '\x7f' + '\x00' + '\x00' + '\x00' + '\x00';
var connectIndex = 0;
var intervalTime = 30;

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
		console.log('receive lidar data')
		console.log(data.length);
		// console.log(hex2a())

		// console.log(hex2a(data));
		if (data[6] == '0x0A') {
			console.log('Gyro');
			gyroData = hex2a(data);
		}
		if (data[6] == '0x07') {
			console.log('Lidar');
			lidarData = data;	
		}
		// console.log("lydar", data)
		// lidarData = hex2a(data);
		// lidarData = data;
		// getLidarData();
	});
}

// function nlistenLidar(client) {
// 	client.on('data', function(data) {
// 		console.log('receive lidar data')
// 		console.log(data.length);

// 		// console.log(hex2a(data));
// 		// console.log("lydar", data)
// 		// lidarData = hex2a(data);
// 		// lidarData = data;
// 		// getLidarData();
// 	});
// }

function nmove (client, trameMotor) {
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

	var lidarData, oldLidarData;
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
			lidarData = getLidarData();

			if ((lidarData != oldLidarData) && (init != 1)) {
				console.log("Obstacle Détecté")
				indexArray = [];
				distanceArray = [];
				calcArray = [];
				alignArray1 = [];
				alignArray2 = [];
				tempArray = [];
				tempArray2 = [];
				console.log('lidarData.length')
				console.log(lidarData.length)
				for(var i = 0; i < lidarData.length; i += 1) {
					if(lidarData[i] != oldLidarData[i]) {
						console.log(i);
						// console.log(lidarData[i]);
						indexArray.push(i)
						distanceArray.push(lidarData[i])
					}
				}

				for(var i = 0; i < indexArray.length; i += 1) {
					calcArray.push((Math.cos(Math.radians(indexArray[i]))*distanceArray[i]).toFixed(2));
					//console.log("lstindex : ",lstIndex[i])
					//console.log("lstdistance : ",lstDistance[i])
					//console.log("lstcalc : ",lstCalc[i])

				}

				// console.log(calcArray)
				// console.log('distanceArray');
				// console.log(distanceArray)
				// console.log('calcArray')
				// console.log(calcArray)
				// console.log('indexArray')
				// console.log(indexArray)

				for(var i = 0; i < calcArray.length; i += 1) {
					for(var j = 0; j < calcArray.length; j += 1) {
						if ((calcArray[i] == calcArray[j])
							&& (j != i)
							&& (calcArray[j] != 0)
							&& (calcArray[i] != 0)
							) {
							result = alignArray1.indexOf(calcArray[j]);
							if (result == -1) {
								alignArray1.push(calcArray[j])
								tmp = []
								tmp.push(indexArray[j])
								alignArray2.push(tmp)
							} else {
								result2 = alignArray2[result].indexOf(indexArray[j]);
								if (result2 == -1) {
									alignArray2[result].push(indexArray[j])
								}
							}
						}
					}
				}

				console.log('alignArray2')
				console.log(alignArray2)

				var alignArray = [];
				var maxLigne = 0;
				alignArray = removeDuplicates(alignArray1)
				size = 0

				console.log(alignArray2)

				for(var i = 0; i < alignArray2.length; i += 1) {
					size += alignArray2[i].length;
					tempArray.push(alignArray2[i].length);
				}
				if ((alignArray2.length) != 0) {
					average = Math.floor(size / alignArray2.length);
				}
				//console.log ("Avg", average)
				console.log('tempArray')
				console.log(tempArray)
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
				while (w == 1) {
					w = 0
					for (var i = 0; i < alignArray2.length; i += 1) {
						//console.log ("Size : ", len(lstAlign2[j]), ", IT : ", j)
						if ((alignArray2[i].length) < average) {
							alignArray1.splice(i, 1);
							alignArray2.splice(i, 1);
							w = 1
							break
						}
					}
				}

				alignArray1.push(4000)
				alignArray1.push(-4000)
				//Correction Trajectoire
				console.log(alignArray1)
				for(index in alignArray1) {
					var value = alignArray1[index];
					if(value < 0) {
						tempArray.push(Math.abs(value))
						// console.log('existDroite');
					} else if (value > 0) {
						tempArray2.push(value)
						// console.log('existGauche')
					}
				}


				// distanceD = Math.min(tempArray);
				var distanceD = tempArray.reduce(function(a,b) {
				  return Math.min(a, b);
				});

				if (distanceD > 1000) {
					distanceD = 0
				}

				// distanceG = Math.min(tempArray2)
				var distanceG = tempArray2.reduce(function(a,b) {
				  return Math.min(a, b);
				});

				if (distanceG > 1000) {
					distanceG = 0
				}
				if ((distanceD != 0) && (distanceG != 0)) {
					invRota = 0
				}

				if((distanceD == 0) && (distanceG>0) && (distanceG<700)) {
					console.log("NOLIGNEDROITE")
					distanceD = distanceG
					if(invRota == 1) {
						invRota = 2
					}
					if(saveOneRange == -1) {
						saveOneRange = distanceG
					} else {
						distanceD = saveOneRange
					}
				}

				if((distanceG == 0) && (distanceD > 0) && (distanceD < 700)) {
					console.log("NOLIGNEGAUCHE")
					distanceG = distanceD
					if(invRota == 1) {
						invRota = 2
					}
					if(saveOneRange == -1) {
						saveOneRange = distanceD
					}
					else {
						distanceG = saveOneRange
					}
				}


				//Sequence d'instruction Motors

				console.log("Droite : " + distanceD)
				console.log("Gauche : " + distanceG)
				console.log("dataDistanceD : " + dataDistanceD)
				console.log("dataDistanceG : " + dataDistanceG)
				console.log("maxLigne : " + maxLigne)
				console.log("recentrage : " + recentrage)

				if ((recentrage == 1) && (maxLigne >= 12)) {
					recentrage = 0
				}
				if ((recentrage == 1) && (maxLigne < 12)) {
					console.log("Recentrage aprés virage")
					// for(var i = 0; i < 10; i += 1) {
						if(nextVirage == 'droite') {
							turnForwardLeft();
						} else {
							turnForwardRight();
						}
					// }
				} else if (((distanceD + distanceG) / 2) > distanceG) {
					console.log("Correction vers la droite")
					turnForwardRight()
					angleCor = angleCor + 0.3
				} else if (((distanceD + distanceG) / 2) > distanceD) {
					console.log("Correction vers la gauche")
					turnForwardLeft()
					angleCor = angleCor - 0.3
				} else if ((distanceD == dataDistanceD) && (distanceG == dataDistanceG)) {
					console.log("Le robot semble au milieu")
				} else {
					console.log("Probleme de correction de trajectoire")
				}

				dataDistanceD = distanceD;
				dataDistanceG = distanceG;
				if ((distanceD == 0) && (distanceG == 0)) {
					console.log("Pas de ligne d'avancement detecté")
					if(recentrage == 0) {
						//Inversion de la Rotation
						if(invRota == 2) {
							if(nextVirage == 'droite') {
								nextVirage = 'gauche';
							} else if (nextVirage == 'gauche') {
								nextVirage = 'droite';
							}
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
					oldLidarData = lidarData;
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
				// turnBackWardLeft();
				console.log("Action Par Default");
				init = 0;
				oldLidarData = lidarData;
				// Gpstemp = Gps;
				// datatemp = data;
			}
			// time.sleep(tps)
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

function Virage3t(nextVirage) {
	console.log("Init Virage3t")
	//Prise de distance
	// console.log("debut de prise de distance")
	// for(var i = 0; i < 50; i += 1) {
	function priseDeDistance() {
		var i = 0;
		var newInterval = setInterval(function() {
			if(i >= 50) {
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
			if(!(angle < (90 + angleCor))) {
				clearInterval(newInterval);
				rotation90Arriere();
			}
			if(nextVirage === 'droite') {
				turnForwardRight();
			} else {
				turnForwardLeft();
			}
			degs = getGyroData();
			angle = angle + (degs);
			console.log("Angle : " + angle)
		}, intervalTime);		
	}

	function rotation90Arriere() {
		var angle = 0;
		var degs = 0;
		var newInterval = setInterval(function() {
			if(!(angle < 40)) {
				clearInterval(newInterval);
				endVirage3T();
			}
			if(nextVirage === 'droite') {
				turnBackWardLeft();
			} else {
				turnBackWardRight();
			}
			degs = getGyroData();
			angle = angle + (degs);
			console.log("Angle : " + angle)
			// time.sleep(tps)
		}, intervalTime)		
	}

	function endVirage3T() {
		if(nextVirage === 'droite') {
			nextVirage = 'gauche';
		} else {
			nextVirage = 'droite';
		}

		recentrage = 1;
		invRota = 1;
		saveOneRange = -1;
		isPaused = false;		
	}


}

function moveForward() {
	console.log('moveForward');
	trameMotor = 	'\x4e' + '\x41' + '\x49' + '\x4f' + '\x30' + '\x31' + '\x01' + '\x00' + '\x00' + '\x00' + '\x02' + '\x7f' + '\x7f' + '\x00' + '\x00' + '\x00' + '\x00';
	nmove(n_motor, trameMotor);
}

function getLidarData() {
	// console.log('getLidarData')
	// return lidarData;
	// console.log(lidarData);
	var tmp = lidarData.slice(103, 463);
	// console.log(tmp)

	// return tmp;
	lidarData = tmp;
	// console.log(lidarData);
	// console.log(lidarData.length)
	var ndata = [];
	for(var i = 0; i < lidarData.length; i += 2) {
		test = [lidarData[i]];
		test2 = [lidarData[i+1]];
		bytes = test.concat(test2);
		// var x = new Uint16Array(bytes)
		var ntest = jspack.jspack.Unpack('H', bytes);
		
		// console.log(ntest);
		ndata.push(ntest[0]);
	}

	// console.log('ndata');
	// console.log(ndata);
	return ndata;
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
	trameMotor = '\x4e' + '\x41' + '\x49' + '\x4f' + '\x30' + '\x31' + '\x01' + '\x00' + '\x00' + '\x00' + '\x02' + '\xc1' + '\x81' + '\x00' + '\x00' + '\x00' + '\x00';
	nmove(n_motor, trameMotor);
}

function turnBackWardRight() {
	console.log('turnBackWardRight')
	trameMotor = '\x4e' + '\x41' + '\x49' + '\x4f' + '\x30' + '\x31' + '\x01' + '\x00' + '\x00' + '\x00' + '\x02' + '\x81' + '\xc1' + '\x00' + '\x00' + '\x00' + '\x00';
	nmove(n_motor, trameMotor);
}

function turnForwardRight() {
	console.log('turnForwardRight')
	trameMotor = '\x4e' + '\x41' + '\x49' + '\x4f' + '\x30' + '\x31' + '\x01' + '\x00' + '\x00' + '\x00' + '\x02' + '\x7f' + '\x3f' + '\x00' + '\x00' + '\x00' + '\x00';
	nmove(n_motor, trameMotor);
}

function turnForwardLeft() {
	console.log('turnForwardLeft')
	trameMotor = '\x4e' + '\x41' + '\x49' + '\x4f' + '\x30' + '\x31' + '\x01' + '\x00' + '\x00' + '\x00' + '\x02' + '\x3f' + '\x7f' + '\x00' + '\x00' + '\x00' + '\x00';
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

// main()
