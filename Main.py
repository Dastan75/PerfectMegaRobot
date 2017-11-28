
#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
#  Main.py
#  
#  Copyright 2016 Admin <Admin@LAPTOP-00MET5Q8>

import Com
import time
import math
import socket

global CheckVirageD
global CheckVirageG
global AngleCor
global recentrage
global InvRota
InvRota = 0
recentrage = 0
AngleCor = 0
CheckVirageD = 1
CheckVirageG = 0

def main():

	i=0
	lstIndex = []
	lstDistance = []
	lstCalc = []
	lstAlign1 = []
	lstAlign2 = []
	lsttemp = []
	lsttemp2 = []
	data = ""
	datatemp = ""
	Gps = ""
	Gpstemp = ""
	init = 1
	distanceD = 0
	distanceG = 0
	existD = 0
	existG = 0
	degs = 0 
	j=0
	global InvRota
	global CheckVirageD
	global CheckVirageG
	global tps
	global DataDistanceD
	global DataDistanceG
	global AngleCor
	global recentrage
	global SaveOneRange
	SaveOneRange = -1
	DataDistanceD = 0
	DataDistanceG = 0
	tps = 0.02
	while 1 :
		i=0
		existD = 0
		existG = 0
		#Gps = Com.Gps()
		data = Com.Lidar()
		#if(all((Value == 4000)for Value in data)):
			#Virage3t()
		if((data != datatemp) and (init!=1)):
			del lstIndex[:],lstDistance[:],lstCalc[:],lstAlign1[:],lstAlign2[:],lsttemp[:],lsttemp2[:],
			for index,val in enumerate(data) :
				if(data[index] != datatemp[index]):
					#print(index,end=" data : ")
					#print(data[index],end=' ')
					#if (data[index] < 4000) :
					lstIndex.append(index)
					lstDistance.append(data[index])
			for i,val in enumerate(lstIndex):
				lstCalc.append(round(math.cos(math.radians(lstIndex[i]))*lstDistance[i],-2))
				#print("lstindex : ",lstIndex[i])
				#print("lstdistance : ",lstDistance[i])
				#print("lstcalc : ",lstCalc[i])
			for j,val in enumerate(lstCalc):
				for k,val in enumerate(lstCalc):
					if ((lstCalc[j] == lstCalc[k])and(j!=k)and(lstCalc[j]!=0)and(lstCalc[k]!=0)):
						result = lstAlign1.index(lstCalc[k]) if lstCalc[k] in lstAlign1 else -1
						if (result == -1):
							lstAlign1.append(lstCalc[k])
							tmp = []
							tmp.append(str(lstIndex[k]))
							lstAlign2.append(tmp)
						else :
							result2 = lstAlign2[result].index(str(lstIndex[k])) if str(lstIndex[k]) in lstAlign2[result] else -1
							if (result2 == -1) :
								lstAlign2[result].append(str(lstIndex[k]))
			#print(lstCalc)
			lstAlign = Com.remove_duplicates(lstAlign1)
			size = 0
			for j, val in enumerate(lstAlign2) :
				size += len(lstAlign2[j])
				lsttemp.append(len(lstAlign2[j]))
			if (len(lstAlign2) != 0) :
				average = size / len(lstAlign2)
			#print ("Avg", average)
			if (len(lsttemp) != 0) :
				Maxligne = max(lsttemp)
			del lsttemp[:]
			w = 1
			distanceD = 0
			distanceG = 0
			while (w == 1) :
				w = 0
				for j, val in enumerate(lstAlign2) :
					#print ("Size : ", len(lstAlign2[j]), ", IT : ", j)
					if (len(lstAlign2[j]) < average) :
						lstAlign1.pop(j)
						lstAlign2.pop(j)
						w = 1
						break
						#print ("Del : ", )
			#print("Liste Align1",lstAlign1)
			#print("Liste Align2",lstAlign2)
			#print("Max ligne : ",Maxligne)
			lstAlign1.append(4000)
			lstAlign1.append(-4000)
			#Correction Trajectoire
			for Value in lstAlign1 :
				if(Value<0):
					lsttemp.append(abs(Value))
					existD = 1
				elif(Value>0):
					lsttemp2.append(Value)
					existG = 1
			distanceD = min(lsttemp)
			if(distanceD > 1000):
				distanceD = 0
			distanceG = min(lsttemp2)
			if(distanceG >1000):
				distanceG = 0
			if((distanceD != 0)and(distanceG != 0)):
				InvRota = 0

			if((distanceD == 0)and(distanceG>0)and(distanceG<700)):
				print("NOLIGNEDROITE")
				distanceD = distanceG
				if(InvRota == 1):
					InvRota = 2
				if(SaveOneRange == -1):
					SaveOneRange = distanceG
				else :
					distanceD = SaveOneRange

			if((distanceG == 0) and(distanceD > 0)and(distanceD < 700)):
				print("NOLIGNEGAUCHE")
				distanceG = distanceD
				if(InvRota == 1):
					InvRota = 2
				if(SaveOneRange == -1):
					SaveOneRange = distanceD
				else :
					distanceG = SaveOneRange
								 
			#print(distanceD)
			#print(distanceG)
			
			#Sequence d'instruction Motors 
			if((recentrage == 1)and(Maxligne >= 12)):
				recentrage = 0
			if((recentrage == 1)and(Maxligne < 12)):
				if(CheckVirageD == 0):
					i=0
					while i<10 :
						Com.VirageD()
						time.sleep(tps)
						i += 1
				elif(CheckVirageG == 0):
					i=0
					while i<10 :
						Com.VirageG()
						time.sleep(tps)
						i += 1
			elif((distanceD+distanceG)/2>distanceG):
				print("Correction vers la droite")
				i=0
				while i<10 :
					Com.VirageD()
					time.sleep(tps)
					i += 1
					AngleCor = AngleCor + 0.3
			elif((distanceD+distanceG)/2>distanceD):
				print("Correction vers la gauche")
				i=0
				while i<10 :
					Com.VirageG()
					time.sleep(tps)
					i += 1
					AngleCor = AngleCor - 0.3
			elif(distanceD == DataDistanceD)and(distanceG == DataDistanceG):
				print("Le robot semble au milieu")
			else:
				print("Probleme de correction de trajectoire")
				
			DataDistanceD = distanceD
			DataDistanceG = distanceG
			print("Droite : ", distanceD)
			print("Gauche : ", distanceG)
			if ((distanceD == 0)and(distanceG == 0)):
				if(recentrage==0):
					#Inversion de la Rotation
					if(InvRota == 2):
						if((CheckVirageD == 1)and(CheckVirageG == 0)):
							CheckVirageD = 0
							CheckVirageG = 1
						elif ((CheckVirageG == 1)and(CheckVirageD == 0)):
							CheckVirageD = 1
							CheckVirageG = 0
					#Rotation
					Virage3t()
			elif all((value>90) for value in lstIndex):
				print("Obstacle uniquement sur la droite")
				Com.Avancer()
			elif all((value<90) for value in lstIndex):
				print("Obstacle uniquement sur la gauche")
				Com.Avancer()
			elif all(((value>60)and(value<120))for value in lstIndex):
				print("Obstacle sur trajectoire")
			else :
				Com.Avancer()		
				Gpstemp = Gps
				datatemp = data
			
			
		#elif(Gps == Gpstemp):
			#Com.Avancer()
			#Gps = Com.Gps()
			#if(Gps == Gpstemp):
				#Com.Reculer()
				#Gps = Com.Gps()
				#if(Gps == Gpstemp):
		else :
			Com.Avancer()
			print("Action Par Default")
			init = 0
			Gpstemp = Gps
			datatemp = data
			
		time.sleep(tps)		
	return 0


def Virage3t():
	i=0
	j=0
	Angle = 0
	global InvRota
	global tps
	global AngleCor
	global CheckVirageD
	global CheckVirageG
	global recentrage
	global SaveOneRange
	degs = 0
	print("Init Virage3t")
	if(CheckVirageD == 1):
		print("demitourdroite")
		#DemitourDroite 3 temps avec gyro 
		#Prise de distance
		while i<50 :
			i=i+1
			Com.Avancer()
			time.sleep(tps)
		print("fin de prise de distance")
		i=0
		while Angle < 90+AngleCor :
			Com.VirageD()
			degs = Com.Gyro()
			Angle = Angle + (degs)
			i=i+1
			print("Angle : ",Angle)
			time.sleep(tps)
		print("fin virage : ",Angle)
		AngleCor = 0
		j=0
		Angle = 0
		while Angle < 40 :
			Com.VirageArrierG()
			degs = Com.Gyro()
			Angle = Angle + (degs)
			print("Angle : ",Angle)
			time.sleep(tps)
		print("fin virage : ",Angle)
		CheckVirageD = 0
		CheckVirageG = 1
		recentrage = 1
		InvRota = 1
		SaveOneRange = -1
	elif(CheckVirageG == 1):
		print("demitourgauche")
		#DemitourGauche 3 temps avec gyro 
		i = 0
		#Prise de distance
		while i<50 :
			i=i+1
			Com.Avancer()
			time.sleep(tps)
		i=0
		while Angle < 90+AngleCor :
			Com.VirageG()
			degs = Com.Gyro()
			Angle = Angle + (degs)
			i=i+1
			print("Angle : ",Angle)
			time.sleep(tps)
		print("fin virage : ",Angle)
		Angle = 0
		AngleCor = 0
		while Angle < 40 :
			Com.VirageArrierD()
			degs = Com.Gyro()
			Angle = Angle + (degs)
			i=i+1
			time.sleep(tps)
		CheckVirageG = 0
		CheckVirageD = 1
		recentrage = 1
		InvRota = 1
		SaveOneRange = -1
	else :
		print("Erreur de Virage 3t")


main()