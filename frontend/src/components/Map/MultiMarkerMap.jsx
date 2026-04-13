import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Custom icon
const createCustomIcon = (color = 'red') => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"></div>`,
    className: 'custom-marker',
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  })
}

const locations = [
  { id: 1, position: [51.505, -0.09], name: 'London', color: 'red' },
  { id: 2, position: [51.51, -0.1], name: 'Location 2', color: 'blue' },
  { id: 3, position: [51.50, -0.08], name: 'Location 3', color: 'green' },
]

const MultiMarkerMap = () => {
  const center = [51.505, -0.09]

  return (
    <div style={{ height: '500px', width: '100%', margin: '20px 0' }}>
      <div style={{ marginBottom: '10px' }}>
        <h2>Multiple Markers with Custom Icons</h2>
      </div>
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map(location => (
          <Marker 
            key={location.id} 
            position={location.position}
            icon={createCustomIcon(location.color)}
          >
            <Popup>
              <strong>{location.name}</strong>
              <br />
              Position: {location.position[0]}, {location.position[1]}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default MultiMarkerMap