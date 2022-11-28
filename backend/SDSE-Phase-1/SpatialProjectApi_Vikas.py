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
    outputfilepath = uuid.uuid4().hex
    inputfilepath = uuid.uuid4().hex
    inputfilepath="./data/{}.json".format(inputfilepath)
    jsonOutput = json.loads(request.data)
    with open(inputfilepath, "w") as outfile:
        json.dump(jsonOutput, outfile)
    command = "$SPARK_HOME/bin/spark-submit ./target/scala-2.12/SDSE-Phase-1-assembly-0.1.jar ./data/output/{} get-trajectory-data {}".format(outputfilepath, inputfilepath)
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
    process.wait()
    print(process.returncode)
    outputList = []
    path = "./data/output/{}/*.json".format(outputfilepath)
    for filename in glob.glob(path):
        with open(filename) as f:
            for jsonObj in f:
                jsonDict = json.loads(jsonObj)
                outputList.append(jsonDict)
    shutil.rmtree("./data/output/{}".format(outputfilepath))
    os.remove(inputfilepath)
    jsonOutput = json.dumps(outputList)
    return jsonOutput

@app.route('/getSpatialRange', methods=['POST'])
def getSpatialRange():
    inputfilepath = uuid.uuid4().hex
    outputfilepath = uuid.uuid4().hex

    inputfilepath="./data/{}.json".format(inputfilepath)
    data = json.loads(request.data)
    body = data['body']

    with open(inputfilepath, "w") as outfile:
        json.dump(body, outfile)

    start_latitude = data['start_latitude']
    end_latitude = data['end_latitude']
    start_longitude = data['start_longitude']
    end_longitude = data['end_longitude']

    command = "$SPARK_HOME/bin/spark-submit ./target/scala-2.12/SDSE-Phase-1-assembly-0.1.jar ./data/output/{} get-spatial-range {} {} {} {} {}".format(outputfilepath,start_latitude,start_longitude,end_latitude,end_longitude,inputfilepath)
    print(command)
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
    process.wait()
    print(process.returncode)
    outputList = []

    path = "./data/output/{}/*.json".format(outputfilepath)
    for filename in glob.glob(path):
        with open(filename) as f:
            for jsonObj in f:
                jsonDict = json.loads(jsonObj)
                outputList.append(jsonDict)
    shutil.rmtree("./data/output/{}".format(outputfilepath))
    os.remove(inputfilepath)
    return json.dumps(outputList)    

@app.route('/getSpatialTemporalRange', methods=['POST'])
def getSpatialTemporalRange():
    inputfilepath = uuid.uuid4().hex
    outputfilepath = uuid.uuid4().hex

    inputfilepath="./data/{}.json".format(inputfilepath)
    data = json.loads(request.data)
    body = data['body']

    with open(inputfilepath, "w") as outfile:
        json.dump(body, outfile)

    start_latitude = data['start_latitude']
    end_latitude = data['end_latitude']
    start_longitude = data['start_longitude']
    end_longitude = data['end_longitude']
    start_time = data['start_time']
    end_time = data['end_time']
    
    command = "$SPARK_HOME/bin/spark-submit ./target/scala-2.12/SDSE-Phase-1-assembly-0.1.jar ./data/output/{} get-spatiotemporal-range {} {} {} {} {} {} {}".format(outputfilepath,start_time, end_time,start_latitude,start_longitude,end_latitude,end_longitude,inputfilepath)
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
    process.wait()
    print(process.returncode)
    outputList = []

    path = "./data/output/{}/*.json".format(outputfilepath)
    for filename in glob.glob(path):
        with open(filename) as f:
            for jsonObj in f:
                jsonDict = json.loads(jsonObj)
                outputList.append(jsonDict)
    shutil.rmtree("./data/output/{}".format(outputfilepath))
    os.remove(inputfilepath)
    return json.dumps(outputList)     

@app.route('/KNN', methods=['POST'])
def getKNN():
    inputfilepath = uuid.uuid4().hex
    outputfilepath = uuid.uuid4().hex

    inputfilepath="./data/{}.json".format(inputfilepath)
    data = json.loads(request.data)
    body = data['body']

    with open(inputfilepath, "w") as outfile:
        json.dump(body, outfile)

    trajectory_id = data['trajectory_id']
    k = data['knnK']

    command = "$SPARK_HOME/bin/spark-submit ./target/scala-2.12/SDSE-Phase-1-assembly-0.1.jar ./data/output/{} get-knn {} {} {}".format(outputfilepath,trajectory_id, k,inputfilepath)
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
    process.wait()
    print(process.returncode)
    outputList = []

    path = "./data/output/{}/*.json".format(outputfilepath)
    for filename in glob.glob(path):
        with open(filename) as f:
            for jsonObj in f:
                jsonDict = json.loads(jsonObj)
                outputList.append(jsonDict)
    shutil.rmtree("./data/output/{}".format(outputfilepath))
    os.remove(inputfilepath)
    return json.dumps(outputList)      

app.run()
