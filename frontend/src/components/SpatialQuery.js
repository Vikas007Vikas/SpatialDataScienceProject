import React, { useState, useContext } from "react";
import { Slider, Typography, TextField, FilledInput } from '@mui/material';
import { observer } from "mobx-react-lite";
import DACStore from '../stores/dacstore.ts';
function SpatialQuery({ title, minV, maxV, stepS, query }) {
    const getText = (value) => value;
    const [textInput, setTextInput] = useState(0);

    const handleTextInputChange = event => {
        setTextInput(event.target.value);
        changeValue(event, event.target.value);
    };
    const changeValue = (event, value) => {
        setTextInput(value);
        if (query == 0) {
            if (title == "Min Latitude") { dacStore.setSpatialRangeMinLat(value); }
            if (title == "Max Latitude") { dacStore.setSpatialRangeMaxLat(value); }
            if (title == "Min Longitude") { dacStore.setSpatialRangeMinLon(value); }
            if (title == "Max Longitude") { dacStore.setSpatialRangeMaxLon(value); }
        }
        else if (query == 1) {
            if (title == "Min Latitude") { dacStore.setSpatialTempRangeMinLat(value); }
            if (title == "Max Latitude") { dacStore.setSpatialTempRangeMaxLat(value); }
            if (title == "Min Longitude") { dacStore.setSpatialTempRangeMinLon(value); }
            if (title == "Max Longitude") { dacStore.setSpatialTempRangeMaxLon(value); }
            if (title == "Min Time") { dacStore.setTime_min(value); }
            if (title == "Max Time") { dacStore.setTime_max(value); }
        }
        else if (query == 2) {
            if (title == "Trajectory ID") { dacStore.setKNN_TrajectoryId(value); }
            if (title == "K") { dacStore.setKNN_K(value); }
        }
    }

    const dacStore = useContext(DACStore);
    return (
        <>
            <Typography id="range-slider" gutterBottom>
                <div> </div><br></br>
                <span style={{ fontSize: 10, fontWeight: 'bold', paddingLeft: "15px" }}>{title} : </span>
                <br></br>
                <TextField id="standard-basic" 
                    value={textInput} inputProps={{ style: { border:"2px solid grey", color: "white", fontSize: 10, width: "70px", backgroudColor : "pink"} }}

                    onChange={handleTextInputChange} />
            </Typography>
        </>
    );
}
export default observer(SpatialQuery);
