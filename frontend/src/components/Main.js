import React, { Component } from 'react';
import { TripsLayer } from '@deck.gl/geo-layers';
import DeckGL from '@deck.gl/react';
import {StaticMap} from 'react-map-gl';
import { BASEMAP } from '@deck.gl/carto';
import { useEffect, useState, useContext } from "react";
import DACStore from '../stores/dacstore.ts';
import { observer } from "mobx-react-lite";

function Main() {
    const dacStore = useContext(DACStore);
    const data = dacStore.jsonData;
    const [time, setTime] = useState(0);
    const [animation] = useState({});
    var animationSpeed = 15;
    var loopLength = 5000;
    const animate = () => {
        setTime(t => (t + animationSpeed) % loopLength);
        animation.id = window.requestAnimationFrame(animate);
    };

    useEffect(() => {
        animation.id = window.requestAnimationFrame(animate);
        return () => window.cancelAnimationFrame(animation.id);
    }, [animation]);

    const randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    const layer = new TripsLayer({
        id: 'trips-layer',
        data,
        getPath: d => d.trajectory.map(p => p._1.reverse()),
        getTimestamps: d => d.trajectory.map(p => p._2 - 1664511371),
        getColor: (d) => [randomBetween(0, 255), randomBetween(0, 255), randomBetween(0, 255)],
        opacity: 0.8,
        widthMinPixels: 5,
        rounded: true,
        fadeTrail: true,
        trailLength: 2000,
        currentTime: time
    });
    return <DeckGL initialViewState={{ longitude: -111.92518396810091, latitude: 33.414291502635706, zoom: 14 }}
        controller={true} layers={[layer]}>
        <StaticMap mapStyle={BASEMAP.VOYAGER} />
    </DeckGL>;
}

export default observer(Main);
