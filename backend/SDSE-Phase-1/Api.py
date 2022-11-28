from flask import Flask, request
import subprocess
import json
import glob 
import uuid
import shutil
import os
from flask_cors import CORS

app = Flask(__name__)

CORS(app)

@app.route('/loadTrajectories', methods=['POST'])
def loadTrajectoryData():

    outputpath = "outfile"
    inputpath = "inputfile"
    inputpath="./data/{}.json".format(inputpath)
    requestjson = json.loads(request.data)
    with open(inputpath, "w") as outfile:
        json.dump(requestjson, outfile)
    command = "$SPARK_HOME/bin/spark-submit ./target/scala-2.12/SDSE-Phase-1-assembly-0.1.jar ./data/output/{} get-trajectory-data {}".format(outputpath, inputpath)
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
    process.wait()
    returnList = []

    path = "./data/output/{}/*.json".format(outputpath)
    print("API call return code : ",process.returncode)

    for filename in glob.glob(path):
        with open(filename) as f:
            for jsonObj in f:
                jsonDict = json.loads(jsonObj)
                returnList.append(jsonDict)
    shutil.rmtree("./data/output/{}".format(outputpath))
    os.remove(inputpath)
    return json.dumps(returnList)

@app.route('/getSpatialRange', methods=['POST'])
def getSpatialRange():
    inputpath = "inputfile"
    outputpath = "outfile"

    inputpath="./data/{}.json".format(inputpath)
    requestdata = json.loads(request.data)
    body = requestdata['body']

    with open(inputpath, "w") as outfile:
        json.dump(body, outfile)

    min_latitude = requestdata['start_latitude']
    max_latitude = requestdata['end_latitude']
    min_longitude = requestdata['start_longitude']
    max_longitude = requestdata['end_longitude']

    command = "$SPARK_HOME/bin/spark-submit ./target/scala-2.12/SDSE-Phase-1-assembly-0.1.jar ./data/output/{} get-spatial-range {} {} {} {} {}".format(outputpath,min_latitude,min_longitude,max_latitude,max_longitude,inputpath)
    print(command)
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
    process.wait()
    returnList = []

    print("API call return code : ",process.returncode)
    path = "./data/output/{}/*.json".format(outputpath)
    for filename in glob.glob(path):
        with open(filename) as f:
            for jsonObj in f:
                jsonDict = json.loads(jsonObj)
                returnList.append(jsonDict)
    shutil.rmtree("./data/output/{}".format(outputpath))
    os.remove(inputpath)
    return json.dumps(returnList)    

@app.route('/getSpatialTemporalRange', methods=['POST'])
def getSpatialTemporalRange():
    inputpath = "inputfile"
    outputpath = "outfile"

    inputpath="./data/{}.json".format(inputpath)
    requestdata = json.loads(request.data)
    body = requestdata['body']

    with open(inputpath, "w") as outfile:
        json.dump(body, outfile)

    min_latitude = requestdata['start_latitude']
    max_latitude = requestdata['end_latitude']
    min_longitude = requestdata['start_longitude']
    max_longitude = requestdata['end_longitude']
    start_time = requestdata['start_time']
    end_time = requestdata['end_time']
    
    command = "$SPARK_HOME/bin/spark-submit ./target/scala-2.12/SDSE-Phase-1-assembly-0.1.jar ./data/output/{} get-spatiotemporal-range {} {} {} {} {} {} {}".format(outputpath,start_time, end_time,min_latitude,min_longitude,max_latitude,max_longitude,inputpath)
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
    process.wait()
    returnList = []

    path = "./data/output/{}/*.json".format(outputpath)
    print("API call return code : ",process.returncode)
    
    for filename in glob.glob(path):
        with open(filename) as f:
            for jsonObj in f:
                jsonDict = json.loads(jsonObj)
                returnList.append(jsonDict)
    shutil.rmtree("./data/output/{}".format(outputpath))
    os.remove(inputpath)
    return json.dumps(returnList)     

@app.route('/KNN', methods=['POST'])
def getKNN():
    inputpath = "input"
    outputpath = "output"

    inputpath="./data/{}.json".format(inputpath)
    requestdata = json.loads(request.data)
    body = requestdata['body']

    with open(inputpath, "w") as outfile:
        json.dump(body, outfile)

    trajectory_id = requestdata['trajectory_id']
    k = requestdata['knnK']

    command = "$SPARK_HOME/bin/spark-submit ./target/scala-2.12/SDSE-Phase-1-assembly-0.1.jar ./data/output/{} get-knn {} {} {}".format(outputpath,trajectory_id, k,inputpath)
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
    process.wait()
    print("API call return code : ", process.returncode)
    returnList = []

    path = "./data/output/{}/*.json".format(outputpath)
    for filename in glob.glob(path):
        with open(filename) as f:
            for jsonObj in f:
                jsonDict = json.loads(jsonObj)
                returnList.append(jsonDict)
    shutil.rmtree("./data/output/{}".format(outputpath))
    os.remove(inputpath)
    return json.dumps(returnList)      

app.run()
