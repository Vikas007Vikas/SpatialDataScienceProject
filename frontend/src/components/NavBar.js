import React, { useState, useContext } from "react";
import { ProSidebar, Menu, MenuItem, SubMenu, SidebarHeader, SidebarContent, SidebarFooter } from "react-pro-sidebar";
import './NavBar.scss';
import { FiArrowLeftCircle, FiArrowRightCircle } from "react-icons/fi";
import { SiApacheairflow } from "react-icons/si";
import { GiAbstract050 } from "react-icons/gi";
import SpatialQuery from "./SpatialQuery.js";
import UploadTrajectoryFile from "./UploadTrajectoryFile.js";
import { Button } from '@mui/material';
import DACStore from '../stores/dacstore.ts';
import { observer } from "mobx-react-lite";
import { CircularProgress, Backdrop } from '@mui/material';


function NavBar() {
    const dacStore = useContext(DACStore);
    const [menuCollapse, setMenuCollapse] = useState(false)
    const menuIconClick = () => {
        menuCollapse ? setMenuCollapse(false) : setMenuCollapse(true);
    };

    const [open, setOpen] = React.useState(false);
    return (
        <div id="header" style={{ height: "100vh"}}>
            <ProSidebar collapsed={menuCollapse}>
                <span style={{ backgroundColor: "#404040"}}>
            
                <SidebarContent>
                
                    <Menu>
                        <Menu title="File Upload">
                            <div> </div>
                            <br></br>
      
                            <div style={{width: "95%", overflow: "hidden", border:"2px solid grey", paddingTop: "10px", paddingBottom: "10px", paddingLeft: "10px" }}>                            
                            <h1>Upload Trajectories</h1>
                            <div style={{width: "150px", float: "left"}}> <UploadTrajectoryFile /> </div>
                            <div style={{marginLeft: "220px"}}> 
                            <Button variant="contained" color="warning" size="small"
                                style={{ marginLeft: 0 }} onClick={async () => {
                                    setOpen(true);
                                    await dacStore.getTrajectoryData();
                                    setOpen(false);
                                }}>
                                Upload
                            </Button>
                             </div>
                            </div>

                            <Backdrop
                                sx={{ color: '#fff', zIndex: 3 }}
                                open={open}
                            >
                                <CircularProgress color="inherit" />
                            </Backdrop>
                            <div> </div>
                            <br></br>
                        </Menu>
                        <Menu title="Spatial Range">
                            <div style={{overflow: "hidden", border:"2px solid grey", paddingBottom: "10px" }}>
                            <h3>Trajectories in a range</h3>
                            <div style={{width: "95%", overflow: "hidden", paddingLeft: "10px" }}>                            
                            <div style={{width: "150px", float: "left"}}> 
                            <SpatialQuery title={'Min Latitude'} minV={-90} maxV={90} stepS={0.000001} query={0} /> </div>
                            <div style={{marginLeft: "180px"}}> 
                            
                            <SpatialQuery title={'Min Longitude'} minV={-180} maxV={180} stepS={0.000001} query={0} />
                            </div>
                            </div>
                            <div style={{width: "95%", overflow: "hidden",  paddingLeft: "10px" }}>
                            <div style={{width: "150px", float: "left"}}> 
                            <SpatialQuery title={'Max Latitude'} minV={-90} maxV={90} stepS={0.000001} query={0} /> </div>
                            <div style={{marginLeft: "180px"}}>
                            <SpatialQuery title={'Max Longitude'} minV={-180} maxV={180} stepS={0.000001} query={0} /> 
                            </div>
                            </div>

                            <div style={{width: "100%", overflow: "hidden",margin: "auto"}}>
                                <Button variant="contained" color="success" size="small"
                                    style={{float: "center", backgroundColor: "#2C53A1" }}
                                    onClick={async () => {
                                        setOpen(true);
                                        await dacStore.getSpatialRangeData();
                                        setOpen(false);
                                    }}>
                                    Search
                                </Button>
                            </div>
                            
                            </div>
                            
                            <div> </div>
                            <br></br>
                        </Menu>
                        <Menu title="SpatioTemporal Range">
                        <div style={{overflow: "hidden", border:"2px solid grey", paddingBottom: "10px" }}>
                        <h3>Spatio Temporal Trajectories</h3>
                            
                        <div style={{width: "95%", overflow: "hidden",  paddingLeft: "10px" }}>                            
                            <div style={{width: "150px", float: "left"}}> 
                            <SpatialQuery title={'Min Latitude'} minV={-90} maxV={90} stepS={0.000001} query={1} /> </div>
                            <div style={{marginLeft: "180px"}}> 
                            
                            <SpatialQuery title={'Min Longitude'} minV={-180} maxV={180} stepS={0.000001} query={1} />
                            </div>
                            </div>
                            <div style={{width: "95%", overflow: "hidden",  paddingLeft: "10px" }}>
                            <div style={{width: "150px", float: "left"}}> 
                            <SpatialQuery title={'Max Latitude'} minV={-90} maxV={90} stepS={0.000001} query={1} /> </div>
                            <div style={{marginLeft: "180px"}}>
                            <SpatialQuery title={'Max Longitude'} minV={-180} maxV={180} stepS={0.000001} query={1} />
                            </div>
                            </div>
                            <div style={{width: "95%", overflow: "hidden",  paddingLeft: "10px" }}>
                            <div style={{width: "150px", float: "left"}}> 
                            <SpatialQuery title={'Min Time'} minV={0} maxV={100000000} stepS={1} query={1} /> </div>
                            <div style={{marginLeft: "180px"}}>
                            <SpatialQuery title={'Max Time'} minV={0} maxV={100000000} stepS={1} query={1} />
                            </div>
                            </div>

                            <div style={{width: "100%", overflow: "hidden",margin: "auto"}}>
                                <Button variant="contained" color="success" size="small"
                                    style={{float: "center", backgroundColor: "#2C53A1" }}
                                    onClick={async () => {
                                        setOpen(true);
                                        await dacStore.getSpatioTemporalRangeData();
                                        setOpen(false);
                                    }}>
                                    Search
                                </Button>
                            </div>
                            </div>
                        </Menu>
                        <Menu title="KNN">
                        <div style={{overflow: "hidden", border:"2px solid grey", paddingBottom: "10px" }}>
                        <h3>KNN</h3>    
                        <div style={{width: "95%", overflow: "hidden", paddingLeft: "10px" }}>
                            <div style={{width: "150px", float: "left"}}> 
                            <SpatialQuery title={'Trajectory ID'} minV={1} maxV={100} stepS={1} query={2} /></div>
                            <div style={{marginLeft: "180px"}}>
                            <SpatialQuery title={'K'} minV={1} maxV={100} stepS={1} query={2} />
                            </div>
                            </div>
                            <div style={{width: "100%", overflow: "hidden",margin: "auto"}}>
                                <Button variant="contained" color="success" size="small"
                                    style={{float: "center", backgroundColor: "#2C53A1" }}
                                    onClick={async () => {
                                        setOpen(true);
                                        await dacStore.getKNN();
                                        setOpen(false);
                                    }}>
                                    Search
                                </Button>
                            </div>
                            </div>
                        </Menu>
                    </Menu>
                </SidebarContent>
                </span>
            </ProSidebar>
        </div>

    )
}
export default observer(NavBar);