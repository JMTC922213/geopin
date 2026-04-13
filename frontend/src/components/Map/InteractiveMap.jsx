import React, { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Component to handle map click events
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng)
    },
  })
  return null
}

const InteractiveMap = () => {
  const [markers, setMarkers] = useState([])
  const center = [51.505, -0.09]

  const handleMapClick = (latlng) => {
    const newMarker = {
      id: Date.now(),
      position: [latlng.lat, latlng.lng],
      name: `Marker ${markers.length + 1}`
    }
    setMarkers([...markers, newMarker])
  }

  const clearMarkers = () => {
    setMarkers([])
  }

  return (
    <div style={{ height: '500px', width: '100%', margin: '20px 0' }}>
      <div style={{ marginBottom: '10px' }}>
        <h2>Interactive Map - Click to Add Markers</h2>
        <button onClick={clearMarkers} style={{ padding: '5px 10px', marginBottom: '10px' }}>
          Clear All Markers ({markers.length})
        </button>
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
        
        <MapClickHandler onMapClick={handleMapClick} />
        
        {markers.map(marker => (
          <Marker key={marker.id} position={marker.position}>
            <Popup>
              <strong>{marker.name}</strong>
              <br />
              Latitude: {marker.position[0].toFixed(4)}
              <br />
              Longitude: {marker.position[1].toFixed(4)}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default InteractiveMap