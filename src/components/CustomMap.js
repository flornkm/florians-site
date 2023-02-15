import * as React from 'react';
import { useState, useRef } from 'react';
import ReactMapGL from 'react-map-gl';

export default function CustomMap() {
  const [viewport, setViewport] = useState({
    width: "100%",
    height: 650, // , [-87.61694, 41.86625]
    latitude: 31.815485031139886,
    longitude: 76.92025126928692,
    zoom: 12,
    pitch: 0,
    bearing: 0
  });
  const mapRef = useRef(null);

  return <ReactMapGL
  {...viewport}
  ref={mapRef}
  transitionDuration={300}
  mapStyle="mapbox://styles/rafilos556/ckhrp0auk0ol119s02qvctvh4"
  mapboxApiAccessToken="pk.eyJ1IjoicmFmaWxvczU1NiIsImEiOiJja2hoaHFwZjcwZ3pyMnFwNmY3aHY2eDg4In0.Ai4rUxBMjwoNzHTIDqmuBA"
  onViewportChange={(nextViewport) => setViewport(nextViewport)}
>
</ReactMapGL>
}
