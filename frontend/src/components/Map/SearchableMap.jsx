import React, { useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Component to change map view
function ChangeView({ center, zoom }) {
  const map = useMap()
  map.setView(center, zoom)
  return null
}

const cities = [
  { name: 'London', position: [51.505, -0.09] },
  { name: 'Paris', position: [48.8566, 2.3522] },
  { name: 'New York', position: [40.7128, -74.0060] },
  { name: 'Tokyo', position: [35.6762, 139.6503] },
  { name: 'Sydney', position: [-33.8688, 151.2093] },
]

const SearchableMap = () => {
  const [selectedCity, setSelectedCity] = useState(cities[0])
  const mapRef = useRef()

  const handleCityChange = (city) => {
    setSelectedCity(city)
  }

  return (
    <div style={{ height: '500px', width: '100%', margin: '20px 0' }}>
      <div style={{ marginBottom: '10px' }}>
        <h2>Searchable Map</h2>
        <select 
          value={selectedCity.name} 
          onChange={(e) => handleCityChange(cities.find(c => c.name === e.target.value))}
          style={{ padding: '5px', minWidth: '200px' }}
        >
          {cities.map(city => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      <MapContainer 
        center={selectedCity.position} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <ChangeView center={selectedCity.position} zoom={13} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={selectedCity.position}>
          <Popup>
            <strong>{selectedCity.name}</strong>
            <br />
            Welcome to {selectedCity.name}!
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}

export default SearchableMap