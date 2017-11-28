#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
#  Com.py
#  
#  Copyright 2016 Admin <Admin@LAPTOP-00MET5Q8>

import socket
import math
import time
from struct import *

global G_IP
G_IP = "192.168.1.95"
#G_IP = "127.0.0.1"
#G_IP = "192.168.1.146"

global MaMotor
MaMotor = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
MaMotor.connect((G_IP,3331))
global MaGPS
MaGPS = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
MaGPS.connect((G_IP,3334))
#global MaLidar
#MaLidar = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
#MaLidar.connect((G_IP,3337))
global MaAccel
MaAccel = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
MaAccel.connect((G_IP,3339))
global MaGyro
MaGyro = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
MaGyro.connect((G_IP,3340))

def Avancer():
	i=0
	global MaMotor
	trame = b'\x4e' + b'\x41' + b'\x49' + b'\x4f' + b'\x30' + b'\x31' + b'\x01' + b'\x00' + b'\x00' + b'\x00' + b'\x02' + b'\x7f' + b'\x7f' + b'\x00' + b'\x00' + b'\x00' + b'\x00';
	#while i!=5 :
	MaMotor.send(trame)
		#i=i+1

def Reculer():
	i=0
	global MaMotor
	trame = b'\x4e' + b'\x41' + b'\x49' + b'\x4f' + b'\x30' + b'\x31' + b'\x01' + b'\x00' + b'\x00' + b'\x00' + b'\x02' + b'\x81' + b'\x81' + b'\x00' + b'\x00' + b'\x00' + b'\x00';
	#while i!= 1:
	MaMotor.send(trame)
		#i=i+1

def VirageD():
	i=0
	global MaMotor
	trame = b'\x4e' + b'\x41' + b'\x49' + b'\x4f' + b'\x30' + b'\x31' + b'\x01' + b'\x00' + b'\x00' + b'\x00' + b'\x02' + b'\x7f' + b'\x3f' + b'\x00' + b'\x00' + b'\x00' + b'\x00';	
	#while i!= 1 :
	MaMotor.send(trame)
		#i=i+1
		
def VirageArrierD():
	i=0
	global MaMotor
	trame = b'\x4e' + b'\x41' + b'\x49' + b'\x4f' + b'\x30' + b'\x31' + b'\x01' + b'\x00' + b'\x00' + b'\x00' + b'\x02' + b'\x81' + b'\xc1' + b'\x00' + b'\x00' + b'\x00' + b'\x00';
	#while i!= 1:
	MaMotor.send(trame)
		#i=i+1

def VirageArrierG():
	i=0
	global MaMotor
	trame = b'\x4e' + b'\x41' + b'\x49' + b'\x4f' + b'\x30' + b'\x31' + b'\x01' + b'\x00' + b'\x00' + b'\x00' + b'\x02' + b'\xc1' + b'\x81' + b'\x00' + b'\x00' + b'\x00' + b'\x00';
	#while i!= 1:
	MaMotor.send(trame)
		#i=i+1

def VirageG():
	i=0
	global MaMotor
	trame = b'\x4e' + b'\x41' + b'\x49' + b'\x4f' + b'\x30' + b'\x31' + b'\x01' + b'\x00' + b'\x00' + b'\x00' + b'\x02' + b'\x3f' + b'\x7f' + b'\x00' + b'\x00' + b'\x00' + b'\x00';
	#while i!= 1:
	MaMotor.send(trame)
		#i=i+1

def Gps() :
	data = None
	global MaGPS
	while data == None :
		data = MaGPS.recv(58)
	#print(data)
	return data
	
def Lidar():
	i = 0
	#global MaLidar
	MaLidar = socket.socket(socket.AF_INET,socket.SOCK_STREAM)
	MaLidar.connect((G_IP,3337))
	data = None
	ndata = []
	while data == None:
		data = (MaLidar.recv(828))
		
	MaLidar.close()
	#time.sleep(1)
	data = data[103:463]
	#print(data)
	while i<len(data) :
		test = data[i:i+1]
		test2 = data[i+1:i+2]
		ntest = unpack('H',test2+test)
		i += 2
		#print(ntest[0])
		ndata.append(ntest[0])
		
	#x = 256*ord(data[103:104]) + ord(data[104:105])
	#test = test.decode('utf-16')
	MaLidar.close()
	#print(data)
	#for index in range(len(data)):
		#data[index] = str(data[index]) + " "
	#print(" ".join([str(i) for i in data]))
	#empty_socket(MaLidar)
	return ndata
	
def Accel():
	data = None
	global MaAccel
	while data == None :
		data = MaAccel.recv(21)
	print(" ".join([str(i) for i in data]))
	return data

def Gyro():
	data = None
	global MaGyro
	while data == None :
		data = MaGyro.recv(21)
	test = data[15:16]
	test2 = data[16:17]
	ntest = unpack('h',test2+test)
	ntest = abs((ntest[0]*0.02)/28)
	print(ntest)
	if((ntest<0.4)and(ntest>0.2)):
		return ntest 
	else:
		return 0.3

def remove_duplicates(li):
    my_set = set()
    res = []
    for e in li:
        if e not in my_set:
            res.append(e)
            my_set.add(e)

    return res
    
#Angle = 0
#Val = 0
#while Angle < 90 :
	#Val = Gyro()
	#Angle = Angle + Val
	#if Angle>360:
		#Angle = 0
	#else :
		#print(Angle)
		#VirageD()
	#time.sleep(0.02)

#i=0
#while i<20:
	#Lidar()
	#i += 1
	
