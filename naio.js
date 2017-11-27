const			net						= require('net');
var				lidarData			= "";
var				gyroData			= "";
// const			IP						= '127.0.0.1';
const			IP						= '192.168.1.95';
var				trameMotor		= '\x4e' + '\x41' + '\x49' + '\x4f' + '\x30' + '\x31' + '\x01' + '\x00' + '\x00' + '\x00' + '\x02' + '\x7f' + '\x7f' + '\x00' + '\x00' + '\x00' + '\x00';
var connectIndex = 0;

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

function nlistenGyro(client) {
	client.on('data', function(data) {
		gyroData = hex2a(data);
	});
}

function nlistenLidar(client) {
	client.on('data', function(data) {
		console.log('receive lidar data')
		// console.log(hex2a(data));
		// console.log("lydar", data)
		lidarData = data;
	});
}

function nmove (client, trameMotor) {
	// setInterval(function(){
		// console.log('sending frame');
	client.write(trameMotor + "\n");
	// }, 30);
}

var n_motor = nconnect(IP, 3331);
var n_lidar = nconnect(IP, 3337);
var n_gyro 	= nconnect(IP, 3340);


nlistenLidar(n_lidar);
nlistenGyro(n_gyro);
nmove(n_motor);


var invRota, size, recentrage, angleCor, tps, saveOneRange;
var nextVirage = 'droite';
tps = 0.2;
saveOneRange = -1;
angleCor = 0;
recentrage = 0;
invRota = 0;


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

			for(var i = 0; i < lidarData.length; i += 1) {
				if(lidarData[i] != oldLidarData[i]) {
					indexArray.push(i)
					distanceArray.push(lidarData[i])
				}
			}

			for(var i = 0; i < indexArray.length; i += 1) {
				calcArray.push(Math.round(Math.cos(Math.radians(indexArray[i]))*distanceArray[i]))
				//console.log("lstindex : ",lstIndex[i])
				//console.log("lstdistance : ",lstDistance[i])
				//console.log("lstcalc : ",lstCalc[i])

			}

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
			var maxLigne;
			alignArray = removeDuplicates(alignArray1)
			size = 0

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

			checkForLignes(distanceD, distanceG, 'droite'); //checkLign
			checkForLignes(distanceG, distanceD, 'gauche');

			function checkForLignes(distance1, distance2, checkDirection) {
				if((distance1 == 0) && (distance2 > 0) && (distance2 < 700)) {
					console.log("Pas de ligne " + checkDirection)
					distance1 = distance2
					if(invRota == 1) {
						invRota = 2
					}

					if(saveOneRange == -1) {
						saveOneRange = distance2;
					} else {
						distance1 = saveOneRange
					}
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
				for(var i = 0; i < 10; i += 1) {
					if(nextVirage == 'droite') {
						turnForwardLeft();
					} else {
						turnForwardRight();
					}
				}
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
					Virage3t(nextVirage)
				}
			} else if (indexArray.every(isOverNinety)) {
				console.log(indexArray)
				console.log("Obstacle uniquement sur la droite")
				moveForward()
			} else if (indexArray.every(isBelowNinety)) {
				console.log(indexArray)
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
	}, 25);
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
	var angle = 0
	var degs = 0
	console.log("Init Virage3t")
	//Prise de distance
	console.log("debut de prise de distance")
	for(var i = 0; i < 50; i += 1) {
		moveForward()
	}
	console.log("fin de prise de distance")
	//Rotation a 90°
	while (angle < (90 + angleCor)) {
		if(nextVirage === 'droite') {
			turnForwardRight();
		} else {
			turnForwardLeft();
		}
		degs = getGyroData;
		angle = angle + (degs);
		i=i+1
		console.log("Angle : " + angle)
		// time.sleep(tps)
	}

	angle = 0;
	while (angle < 40) {
		if(nextVirage === 'droite') {
			turnBackWardLeft();
		} else {
			turnBackWardRight();
		}
		degs = getGyroData();
		angle = angle + (degs);
		console.log("Angle : " + angle)
		// time.sleep(tps)
	}
	console.log("fin virage : " + angle)
	if(nextVirage === 'droite') {
		nextVirage = 'gauche';
	} else {
		nextVirage = 'droite';
	}

	recentrage = 1
	invRota = 1
	saveOneRange = -1

}

function moveForward() {
	console.log('moveForward');
	trameMotor = 	'\x4e' + '\x41' + '\x49' + '\x4f' + '\x30' + '\x31' + '\x01' + '\x00' + '\x00' + '\x00' + '\x02' + '\x7f' + '\x7f' + '\x00' + '\x00' + '\x00' + '\x00';
	nmove(n_motor, trameMotor);
}

function getLidarData() {
	console.log('getLidarData')
	console.log(lidarData);
	console.log(lidarData.length)
	return lidarData;
}

function getGyroData() {
	console.log('getGyroData');
	console.log(gyroData);
	return gyroData;
}

function turnBackWardLeft() {
	console.log('turnBackWardLeft')
	trameMotor = '\x4e' + '\x41' + '\x49' + '\x4f' + '\x30' + '\x31' + '\x01' + '\x00' + '\x00' + '\x00' + '\x02' + '\x81' + '\x81' + '\x00' + '\x00' + '\x00' + '\x00';
	nmove(n_motor, trameMotor);
}

function turnBackWardRight() {
	console.log('turnBackWardRight')
	trameMotor = '\x4e' + '\x41' + '\x49' + '\x4f' + '\x30' + '\x31' + '\x01' + '\x00' + '\x00' + '\x00' + '\x02' + '\x81' + '\x81' + '\x00' + '\x00' + '\x00' + '\x00';
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
