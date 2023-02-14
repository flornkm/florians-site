import * as React from 'react';
import Map from 'react-map-gl';

export default function CustomMap() {
  return <Map
    initialViewState={{
      longitude: -100,
      latitude: 40,
      zoom: 3.5
    }}
    style={{width: 400, height: 400}}
    mapStyle="mapbox://styles/mapbox/streets-v9"
  />;
}
