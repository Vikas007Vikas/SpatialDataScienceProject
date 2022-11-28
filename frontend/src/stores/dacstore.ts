import { observable, action, computed } from "mobx";
import { createContext } from "react";

class DACStore {
    @observable originalData: any = undefined;
    @observable jsonData: any = undefined;
    @observable trajectoryData: any = undefined;

    @observable inputData: any = undefined;

    // Variables to store input data or user entries
    // Spatial range user entries
    @observable spatial_range_minlat = 0;
    @observable spatial_range_maxlat = 0;
    @observable spatial_range_minlon = 0;
    @observable spatial_range_maxlon = 0;

    // Spatial temporal range user entries
    @observable spatial_temporal_range_minlat = 0;
    @observable spatial_temporal_range_minlon = 0;
    @observable spatial_temporal_range_maxlat = 0;
    @observable spatial_temporal_range_maxlon = 0;
    @observable min_time = 0;
    @observable max_time = 0;

    // KNN user entries
    @observable knn_trajectoryId = 0;
    @observable knn_numNeighbors = 0;

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    @action getTrajectoryData = async () => {
        try {
            const requestOptions = {
                method: 'POST',
                headers: { 'Accept': 'application/json','Content-Type': 'application/json','Access-Control-Allow-Origin': 'http://localhost:3000/' },
                body: JSON.stringify(this.inputData)
            };
            const response = await fetch('http://localhost:5000/loadTrajectories', requestOptions);
            const data = await response.text();
            // this.jsonData = JSON.parse(data);
            // this.trajectoryData = JSON.parse(data);
            this.originalData = JSON.parse(data)
            this.jsonData = this.convertTrajectoryData(data);
            this.trajectoryData = this.convertTrajectoryData(data);
        } catch (error) {
            console.log("error", error);
        }
    }

    @action getSpatialRangeData = async () => {
        if (this.originalData == undefined) {
            alert('Please Input the data');
            return;
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Accept': 'application/json','Content-Type': 'application/json','Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({'body':this.originalData,'start_latitude': this.spatial_range_minlat,
             'start_longitude':this.spatial_range_minlon, 'end_latitude':this.spatial_range_maxlat, 'end_longitude':this.spatial_range_maxlon})
        };
        const response = await fetch('http://localhost:5000/getSpatialRange', requestOptions);
        const data = await response.json();
        this.jsonData = this.convertRangeData(data);
    }

    @action getSpatioTemporalRangeData = async () => {
        if (this.originalData == undefined) {
            alert('Please Input the data');
            return;
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Accept': 'application/json','Content-Type': 'application/json','Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({'body':this.originalData,'start_latitude': this.spatial_temporal_range_minlat,
             'start_longitude':this.spatial_temporal_range_minlon, 'end_latitude':this.spatial_temporal_range_maxlat, 'end_longitude':this.spatial_temporal_range_maxlon, 
             'start_time':this.min_time, 'end_time':this.max_time})
        };
        const response = await fetch('http://localhost:5000/getSpatialTemporalRange', requestOptions);
        const data = await response.json();
        this.jsonData = this.convertRangeData(data);
    }

    @action getKNN = async () => {
        if (this.originalData == undefined) {
            alert('Please Input the data');
            return;
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Accept': 'application/json','Content-Type': 'application/json','Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({'body':this.originalData,'trajectory_id': this.knn_trajectoryId,'knnK':this.knn_numNeighbors})
        };
        const response = await fetch('http://localhost:5000/KNN', requestOptions);
        const data = await response.json();
        this.jsonData = this.convertKNNData(data);
    }

    // OnClick text actions for Spatial Range query
    @action setSpatialRangeMinLat = (entry) => {
        this.spatial_range_minlat = entry;
    }
    @action setSpatialRangeMaxLat = (entry) => {
        this.spatial_range_maxlat = entry;
    }
    @action setSpatialRangeMinLon = (entry) => {
        this.spatial_range_minlon = entry;
    }
    @action setSpatialRangeMaxLon = (entry) => {
        this.spatial_range_maxlon = entry;
    }

    // OnClick text actions for Spatial Temporal Range query
    @action setSpatialTempRangeMinLat = (entry) => {
        this.spatial_temporal_range_minlat = entry;
    }
    @action setSpatialTempRangeMaxLat = (entry) => {
        this.spatial_temporal_range_maxlat = entry;
    }
    @action setSpatialTempRangeMinLon = (entry) => {
        this.spatial_temporal_range_minlon = entry;
    }
    @action setSpatialTempRangeMaxLon = (entry) => {
        this.spatial_temporal_range_maxlon = entry;
    }
    @action setTime_min = (entry) => {
        this.min_time = entry;
    }
    @action setTime_max = (entry) => {
        this.max_time = entry;
    }

    // OnClick text actions for KNN query
    @action setKNN_TrajectoryId = (entry) => {
        this.knn_trajectoryId = entry;
    }
    @action setKNN_K = (entry) => {
        this.knn_numNeighbors = entry;
    }

    // Convert raw trajectory data to the required format for DeckGL
    private convertTrajectoryData = (ele) => {
        console.log(ele)
        ele = JSON.parse(ele)
        const res: any = []
        for (let i=0; i<ele.length; i++)
        {
            const fin: any = [];
            for(let j=0; j<ele[i].trajectory.length;j++)
            {
                const loc: any = [];
                loc.push(ele[i].trajectory[j].lat)
                loc.push(ele[i].trajectory[j].lon)
                fin.push({_1: loc, _2: ele[i].trajectory[j].timestamp})
            }
            res.push({trajectory: fin, trajectory_id: ele[i].trajectory_id, vehicle_id: ele[i].vehicle_id, maxLon: ele[i].maxLon, minLon: ele[i].minLon, maxLat: ele[i].maxLat, minLat: ele[i].minLat})
        }
        console.log(res)
        return res;
    }

    // Convert Spatial Range and Spatial Temporal range output to the required format for DeckGL
    private convertRangeData = (rangeData) => {
        const trips = rangeData.map((elem) => {
            const res: any = [];
            for (let index = 0; index < elem.location.length; index++) {
                res.push({ _1: elem.location[index], _2: elem.timestamp[index] });
            }
            return { ...elem, trajectory: res };
        });
        return trips;
    };

    // Convert KNN output to the required format for DeckGL
    private convertKNNData = (data) => {
        const trips = this.trajectoryData.filter((trajectory) => {
            if (
                data.find((kTrajectory) => {
                    return kTrajectory.trajectory_id === trajectory.trajectory_id;
                })
            )
                return trajectory;
        });
        return trips;
    };

}
export default createContext(new DACStore());