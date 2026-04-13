import React, { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import L from 'leaflet'
import 'leaflet-routing-machine'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom icon creator for different marker types - using actual image icons
const createCustomIcon = (color = 'red', type = 'custom') => {
  // Map of icon URLs for different types
  const iconMap = {
    'shop': '/images/mcdonalds-logo.png', // McDonald's logo (local)
    'preset': 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Location pin icon
    'custom': 'https://cdn-icons-png.flaticon.com/512/447/447031.png', // Red marker icon
  };

  // Color-based icons for custom markers
  const colorIconMap = {
    'blue': 'https://cdn-icons-png.flaticon.com/512/684/684809.png',
    'orange': 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
    'red': 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
    'green': 'https://cdn-icons-png.flaticon.com/512/684/684815.png',
    'purple': 'https://cdn-icons-png.flaticon.com/512/9356/9356230.png',
    '#FFC72C': '/images/mcdonalds-logo.png', // McDonald's yellow (local)
    '#9b59b6': 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  };

  // Select icon URL based on type or color
  let iconUrl = iconMap[type] || colorIconMap[color] || iconMap['custom'];

  // Create and return the icon
  return L.icon({
    iconUrl: iconUrl,
    iconSize: type === 'shop' ? [36, 36] : [32, 32],
    iconAnchor: type === 'shop' ? [18, 36] : [16, 32],
    popupAnchor: [0, -32],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
  });
}

// Component to handle map click events
function MapClickHandler({ onMapClick, isClickToAddEnabled }) {
  useMapEvents({
    click: (e) => {
      if (isClickToAddEnabled && onMapClick) {
        onMapClick(e.latlng)
      }
    },
  })
  return null
}

// Component to change map view
function ChangeView({ center, zoom }) {
  const map = useMap()
  if (center && Array.isArray(center) && center.length === 2) {
    map.setView(center, zoom)
  }
  return null
}

// Routing component for path finding
function RoutingMachine({ waypoints }) {
  const map = useMap()

  useEffect(() => {
    if (!map || !waypoints || waypoints.length < 2) return

    const routingControl = L.Routing.control({
      waypoints: waypoints.map(point => L.latLng(point[0], point[1])),
      routeWhileDragging: true,
      showAlternatives: true,
      addWaypoints: false,
      lineOptions: {
        styles: [
          { color: '#3498db', opacity: 0.8, weight: 6 }
        ]
      },
      createMarker: function() { return null; }, // Don't create default markers
    }).addTo(map)

    return () => {
      if (routingControl) {
        map.removeControl(routingControl)
      }
    }
  }, [map, waypoints])

  return null
}

// Predefined locations with different marker types
const predefinedLocations = [
  { id: 'default', position: [22.422298471146465, 114.2013092532864], name: 'Default Location', color: '#9b59b6', type: 'preset'},
  { id: 'shop1', position: [22.422485971424166, 114.22689249883692], name: "McDonald's", color: '#FFC72C', type: 'shop' },
  { id: 'shop2', position: [22.40935180871288, 114.22177445328528], name: "McDonald's", color: '#FFC72C', type: 'shop'},
  { id: 'shop3', position: [22.402208163555617, 114.20554342078586], name: "McDonald's", color: '#FFC72C', type: 'shop' },
]

// Cities for navigation
const cities = [
  { name: 'London', position: [51.505, -0.09] },
  { name: 'Paris', position: [48.8566, 2.3522] },
  { name: 'New York', position: [40.7128, -74.0060] },
  { name: 'Tokyo', position: [35.6762, 139.6503] },
  { name: 'Sydney', position: [-33.8688, 151.2093] },
]

// Default starting location
const defaultLocation = {
  name: 'Default Location',
  position: [22.422298471146465, 114.2013092532864]
}

const categoryOptions = [
  { value: 'general', label: 'General', color: 'orange' },
  { value: 'food', label: 'Food', color: '#e67e22' },
  { value: 'home', label: 'Home', color: '#2ecc71' },
  { value: 'work', label: 'Work', color: '#9b59b6' },
  { value: 'travel', label: 'To-Visit', color: '#2980b9' },
]

const categoryColorMap = categoryOptions.reduce((acc, cur) => {
  acc[cur.value] = cur.color
  return acc
}, {})

const API_BASE = 'http://localhost:53840'

const CombinedMap = ({ user }) => {
  const [selectedCity, setSelectedCity] = useState(defaultLocation)
  const [savedMarkers, setSavedMarkers] = useState([])
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [pendingLocation, setPendingLocation] = useState(null)
  const [newLocationForm, setNewLocationForm] = useState({ name: '', category: 'general', description: '' })
  const [filterCategory, setFilterCategory] = useState('all')
  const [showMineOnly, setShowMineOnly] = useState(false)
  const [savingLocation, setSavingLocation] = useState(false)
  const [showPresetMarkers, setShowPresetMarkers] = useState(true)
  const [isClickToAddEnabled, setIsClickToAddEnabled] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [routeStart, setRouteStart] = useState(null)
  const [routeEnd, setRouteEnd] = useState(null)
  const [isRoutingMode, setIsRoutingMode] = useState(false)
  const mapRef = useRef()

  useEffect(() => {
    fetchSavedLocations()
  }, [])

  const fetchSavedLocations = async () => {
    setLoadingLocations(true)
    setLocationError('')
    try {
      const res = await fetch(`${API_BASE}/locations`)
      const data = await res.json()
      if (res.ok && data.success) {
        const mapped = (data.locations || []).map((loc) => ({
          ...loc,
          id: loc._id?.toString() || `db-${loc.name}-${Math.random()}`,
          position: [loc.latitude, loc.longitude],
          type: 'custom',
          color: categoryColorMap[loc.category] || 'orange',
        }))
        setSavedMarkers(mapped)
      } else {
        setLocationError(data.message || 'Failed to load locations')
      }
    } catch (err) {
      console.error('Failed to load locations', err)
      setLocationError('Network error while loading locations')
    } finally {
      setLoadingLocations(false)
    }
  }

  const handleMapClick = (latlng) => {
    // Handle routing mode clicks
    if (isRoutingMode) {
      if (!routeStart) {
        setRouteStart([latlng.lat, latlng.lng])
      } else if (!routeEnd) {
        setRouteEnd([latlng.lat, latlng.lng])
      }
      return
    }

    if (!isClickToAddEnabled) return

    // Store coordinates for the new location form
    setPendingLocation([latlng.lat, latlng.lng])
  }

  const clearRoute = () => {
    setRouteStart(null)
    setRouteEnd(null)
  }

  const toggleRoutingMode = () => {
    if (isRoutingMode) {
      clearRoute()
    }
    setIsRoutingMode(!isRoutingMode)
    setIsClickToAddEnabled(false) // Disable marker adding when routing
    setPendingLocation(null)
  }

  const handleCityChange = (city) => {
    setSelectedCity(city)
  }

  const handleSaveLocation = async () => {
    if (!pendingLocation) {
      setLocationError('Click on the map to pick coordinates')
      return
    }
    if (!newLocationForm.name.trim()) {
      setLocationError('Please enter a name for the location')
      return
    }

    setSavingLocation(true)
    setLocationError('')
    try {
      const res = await fetch(`${API_BASE}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLocationForm.name.trim(),
          latitude: pendingLocation[0],
          longitude: pendingLocation[1],
          category: newLocationForm.category,
          description: newLocationForm.description,
          userId: user?.email || 'guest',
        }),
      })

      const data = await res.json()
      if (res.ok && data.success && data.location) {
        const loc = data.location
        const mapped = {
          ...loc,
          id: loc._id?.toString() || `db-${loc.name}-${Math.random()}`,
          position: [loc.latitude, loc.longitude],
          type: 'custom',
          color: categoryColorMap[loc.category] || 'orange',
        }
        setSavedMarkers(prev => [mapped, ...prev])
        setPendingLocation(null)
        setNewLocationForm({ name: '', category: 'general', description: '' })
      } else {
        setLocationError(data.message || 'Failed to save location')
      }
    } catch (err) {
      console.error('Failed to save location', err)
      setLocationError('Network error while saving')
    } finally {
      setSavingLocation(false)
    }
  }

  const handleDeleteLocation = async (markerId) => {
    if (!markerId) return
    const idString = markerId.toString ? markerId.toString() : markerId
    try {
      const res = await fetch(`${API_BASE}/locations/${idString}`, { method: 'DELETE' })
      if (res.ok) {
        setSavedMarkers(prev => prev.filter(marker => marker.id !== idString && marker._id?.toString() !== idString))
      }
    } catch (err) {
      console.error('Failed to delete location', err)
      setLocationError('Could not delete location right now')
    }
  }

  const togglePresetMarkers = () => {
    setShowPresetMarkers(!showPresetMarkers)
  }

  const toggleClickToAdd = () => {
    const next = !isClickToAddEnabled
    setIsClickToAddEnabled(next)
    if (!next) {
      setPendingLocation(null)
    }
  }

  const handleShopClick = (shop) => {
    setSelectedCity({
      name: shop.name,
      position: shop.position
    })
  }

  const handleMarkerClick = (marker) => {
    setSelectedCity({
      name: marker.name,
      position: marker.position
    })
  }

  const getMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const newLocation = {
          position: [latitude, longitude],
          name: 'My Location'
        }

        // Center map on user's location
        setSelectedCity(newLocation)

        // Prime the new-location form with current coordinates
        setIsClickToAddEnabled(true)
        setPendingLocation([latitude, longitude])
        setNewLocationForm((prev) => ({
          ...prev,
          name: prev.name || 'My Current Location',
          category: prev.category || 'general',
          description: prev.description || `My current location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`
        }))
        setIsGettingLocation(false)
      },
      (error) => {
        setIsGettingLocation(false)
        let errorMessage = 'Unable to retrieve your location. '
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access was denied by user.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.'
            break
          default:
            errorMessage += 'An unknown error occurred.'
            break
        }
        
        alert(errorMessage)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  const filteredSavedMarkers = savedMarkers.filter((marker) => {
    const matchesCategory = filterCategory === 'all' || marker.category === filterCategory
    const matchesOwner = !showMineOnly || !user?.email || marker.ownerEmail === user.email
    return matchesCategory && matchesOwner
  })

  const allMarkers = [
    ...(showPresetMarkers ? predefinedLocations : []),
    ...filteredSavedMarkers
  ]

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{ height: '600px', width: '100%', margin: '20px 0', position: 'relative' }}>
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        zIndex: 1000, 
        backgroundColor: 'white', 
        padding: '15px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        minWidth: '250px',
        maxWidth: '300px'
      }}>
        <div style={{ margin: '0 0 15px 0', fontSize: '20px', fontWeight: 'bold', color: '#2c3e50', textAlign: 'center', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
          Zhang Chin Ming
        </div>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#333' }}>Map Controls</h3>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Navigate to City:</label>
          <select 
            value={selectedCity.name} 
            onChange={(e) => {
              if (e.target.value === 'Default Location') {
                handleCityChange(defaultLocation)
              } else {
                handleCityChange(cities.find(c => c.name === e.target.value))
              }
            }}
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid #ddd',
              fontSize: '14px'
            }}
          >
            <option value="Default Location">Default Location</option>
            {cities.map(city => (
              <option key={city.name} value={city.name}>{city.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={togglePresetMarkers}
            style={{ 
              width: '100%', 
              padding: '8px', 
              backgroundColor: showPresetMarkers ? '#28a745' : '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {showPresetMarkers ? 'Hide Preset Markers' : 'Show Preset Markers'}
         </button>
       </div>

        <div style={{ marginBottom: '10px' }}>
           <button 
             onClick={toggleClickToAdd}
             style={{ 
               width: '100%', 
               padding: '8px', 
               backgroundColor: isClickToAddEnabled ? '#007bff' : '#6c757d', 
               color: 'white', 
               border: 'none', 
               borderRadius: '4px',
               cursor: 'pointer',
               fontSize: '14px'
             }}
           >
             {isClickToAddEnabled ? 'Disable Click to Add' : 'Enable Click to Add'}
           </button>
         </div>

         <div style={{ marginBottom: '10px' }}>
           <button 
             onClick={getMyLocation}
             disabled={isGettingLocation}
             style={{ 
               width: '100%', 
               padding: '8px', 
               backgroundColor: isGettingLocation ? '#6c757d' : '#17a2b8', 
               color: 'white', 
               border: 'none', 
               borderRadius: '4px',
               cursor: isGettingLocation ? 'not-allowed' : 'pointer',
               fontSize: '14px',
               opacity: isGettingLocation ? 0.6 : 1,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               gap: '8px'
             }}
           >
             {isGettingLocation ? (
               <>
                 <span style={{ 
                   display: 'inline-block',
                   width: '12px',
                   height: '12px',
                   border: '2px solid #ffffff',
                   borderTop: '2px solid transparent',
                   borderRadius: '50%',
                   animation: 'spin 1s linear infinite'
                 }}></span>
                 Getting Location...
               </>
             ) : (
               <>
                 📍 My Location
               </>
             )}
           </button>
         </div>

         {/* Persisted Locations Form */}
         <div style={{ borderTop: '2px solid #eee', paddingTop: '15px', marginTop: '15px', marginBottom: '10px' }}>
           <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>Save Location to Database</h4>
           <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
             Enable "Click to Add" then click on the map to pick coordinates. Data is stored in MongoDB and reloads across sessions.
           </p>
           <div style={{ marginBottom: '8px' }}>
             <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Name</label>
             <input
               type="text"
               value={newLocationForm.name}
               onChange={(e) => setNewLocationForm({ ...newLocationForm, name: e.target.value })}
               style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', marginTop: '4px' }}
               placeholder="e.g. Home, Cafe, Lecture Hall"
             />
           </div>
           <div style={{ marginBottom: '8px' }}>
             <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Category</label>
             <select
               value={newLocationForm.category}
               onChange={(e) => setNewLocationForm({ ...newLocationForm, category: e.target.value })}
               style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', marginTop: '4px' }}
             >
               {categoryOptions.map((option) => (
                 <option key={option.value} value={option.value}>{option.label}</option>
               ))}
             </select>
           </div>
           <div style={{ marginBottom: '8px' }}>
             <label style={{ fontWeight: 'bold', fontSize: '13px' }}>Description</label>
             <textarea
               value={newLocationForm.description}
               onChange={(e) => setNewLocationForm({ ...newLocationForm, description: e.target.value })}
               rows="2"
               style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', marginTop: '4px', resize: 'vertical' }}
               placeholder="Notes, opening hours, meeting point..."
             />
           </div>
           <div style={{ marginBottom: '8px', fontSize: '12px', color: pendingLocation ? '#2ecc71' : '#e67e22' }}>
             {pendingLocation ? `Picked: ${pendingLocation[0].toFixed(4)}, ${pendingLocation[1].toFixed(4)}` : 'Click on the map to pick coordinates'}
           </div>
           {locationError && (
             <div style={{ backgroundColor: '#fdecea', color: '#d93025', padding: '8px', borderRadius: '4px', border: '1px solid #f5c6cb', marginBottom: '8px' }}>
               {locationError}
             </div>
           )}
           <div style={{ display: 'flex', gap: '8px' }}>
             <button
               onClick={handleSaveLocation}
               disabled={savingLocation}
               style={{ 
                 flex: 2,
                 padding: '10px', 
                 backgroundColor: savingLocation ? '#6c757d' : '#27ae60', 
                 color: 'white', 
                 border: 'none', 
                 borderRadius: '4px',
                 cursor: savingLocation ? 'not-allowed' : 'pointer',
                 fontSize: '14px'
               }}
             >
               {savingLocation ? 'Saving...' : 'Save Location'}
             </button>
             <button
               onClick={() => { setPendingLocation(null); setNewLocationForm({ name: '', category: 'general', description: '' }); setLocationError(''); }}
               style={{ 
                 flex: 1,
                 padding: '10px', 
                 backgroundColor: '#e0e0e0', 
                 color: '#333', 
                 border: 'none', 
                 borderRadius: '4px',
                 cursor: 'pointer',
                 fontSize: '14px'
               }}
             >
               Reset
             </button>
           </div>
         </div>

         {/* Filters for saved locations */}
         <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', marginBottom: '12px' }}>
           <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#333' }}>Filter Saved Locations</h4>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
             <select
               value={filterCategory}
               onChange={(e) => setFilterCategory(e.target.value)}
               style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
             >
               <option value="all">All categories</option>
               {categoryOptions.map((option) => (
                 <option key={option.value} value={option.value}>{option.label}</option>
               ))}
             </select>
             {user?.email && (
               <label style={{ fontSize: '13px', color: '#555', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <input
                   type="checkbox"
                   checked={showMineOnly}
                   onChange={(e) => setShowMineOnly(e.target.checked)}
                 />
                 Show only my locations ({user.email})
               </label>
             )}
             <div style={{ display: 'flex', gap: '8px' }}>
               <button
                 onClick={fetchSavedLocations}
                 style={{ flex: 1, padding: '8px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
               >
                 Refresh from DB
               </button>
               <span style={{ fontSize: '12px', color: '#666', alignSelf: 'center' }}>
                 Showing {filteredSavedMarkers.length}/{savedMarkers.length || 0}
               </span>
             </div>
             {loadingLocations && <div style={{ fontSize: '12px', color: '#555' }}>Loading locations...</div>}
           </div>
         </div>
        <div style={{ marginBottom: '10px' }}>
           <button 
             onClick={toggleClickToAdd}
             style={{ 
               width: '100%', 
               padding: '8px', 
               backgroundColor: isClickToAddEnabled ? '#007bff' : '#6c757d', 
               color: 'white', 
               border: 'none', 
               borderRadius: '4px',
               cursor: 'pointer',
               fontSize: '14px'
             }}
           >
             {isClickToAddEnabled ? 'Disable Click to Add' : 'Enable Click to Add'}
           </button>
         </div>

         <div style={{ marginBottom: '10px' }}>
           <button 
             onClick={getMyLocation}
             disabled={isGettingLocation}
             style={{ 
               width: '100%', 
               padding: '8px', 
               backgroundColor: isGettingLocation ? '#6c757d' : '#17a2b8', 
               color: 'white', 
               border: 'none', 
               borderRadius: '4px',
               cursor: isGettingLocation ? 'not-allowed' : 'pointer',
               fontSize: '14px',
               opacity: isGettingLocation ? 0.6 : 1,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               gap: '8px'
             }}
           >
             {isGettingLocation ? (
               <>
                 <span style={{ 
                   display: 'inline-block',
                   width: '12px',
                   height: '12px',
                   border: '2px solid #ffffff',
                   borderTop: '2px solid transparent',
                   borderRadius: '50%',
                   animation: 'spin 1s linear infinite'
                 }}></span>
                 Getting Location...
               </>
             ) : (
               <>
                 📍 My Location
               </>
             )}
           </button>
         </div>

         {/* Path Finding Section */}
         <div style={{ borderTop: '2px solid #eee', paddingTop: '15px', marginTop: '15px', marginBottom: '15px' }}>
           <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>
             🗺️ Path Finding
           </h4>

           <div style={{ marginBottom: '10px' }}>
             <button
               onClick={toggleRoutingMode}
               style={{
                 width: '100%',
                 padding: '8px',
                 backgroundColor: isRoutingMode ? '#9b59b6' : '#6c757d',
                 color: 'white',
                 border: 'none',
                 borderRadius: '4px',
                 cursor: 'pointer',
                 fontSize: '14px',
                 fontWeight: 'bold'
               }}
             >
               {isRoutingMode ? '🚗 Routing Mode ON' : 'Enable Route Finding'}
             </button>
           </div>

           {isRoutingMode && (
             <>
               <div style={{
                 backgroundColor: '#f0f8ff',
                 padding: '10px',
                 borderRadius: '4px',
                 marginBottom: '10px',
                 fontSize: '12px',
                 border: '1px solid #3498db'
               }}>
                 <strong>📍 Instructions:</strong><br/>
                 1. Click on map for START point<br/>
                 2. Click again for END point<br/>
                 Route will calculate automatically
               </div>

               {routeStart && (
                 <div style={{
                   backgroundColor: '#d4edda',
                   padding: '8px',
                   borderRadius: '4px',
                   marginBottom: '8px',
                   fontSize: '12px'
                 }}>
                   ✅ Start: {routeStart[0].toFixed(4)}, {routeStart[1].toFixed(4)}
                 </div>
               )}

               {routeEnd && (
                 <div style={{
                   backgroundColor: '#d4edda',
                   padding: '8px',
                   borderRadius: '4px',
                   marginBottom: '8px',
                   fontSize: '12px'
                 }}>
                   ✅ End: {routeEnd[0].toFixed(4)}, {routeEnd[1].toFixed(4)}
                 </div>
               )}

               {(routeStart || routeEnd) && (
                 <button
                   onClick={clearRoute}
                   style={{
                     width: '100%',
                     padding: '8px',
                     backgroundColor: '#e74c3c',
                     color: 'white',
                     border: 'none',
                     borderRadius: '4px',
                     cursor: 'pointer',
                     fontSize: '12px'
                   }}
                 >
                   Clear Route
                 </button>
               )}
             </>
         )}
        </div>

        {/* Saved locations list */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>
            Saved Markers ({filteredSavedMarkers.length})
          </h4>
          
          {filteredSavedMarkers.length === 0 ? (
            <p style={{ 
              margin: '0', 
              fontSize: '14px', 
              color: '#666', 
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '10px'
            }}>
              No saved markers yet.<br />
              Pick a spot on the map and click "Save Location".
            </p>
          ) : (
            <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
              {filteredSavedMarkers.map((marker, index) => (
                <div 
                  key={marker.id} 
                  style={{ 
                    backgroundColor: '#f8f9fa', 
                    border: '1px solid #dee2e6', 
                    borderRadius: '4px', 
                    padding: '8px', 
                    marginBottom: '8px',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '4px'
                  }}>
                    <strong style={{ color: '#495057' }}>
                      {marker.name || `Marker #${index + 1}`}
                    </strong>
                    <button
                      onClick={() => handleDeleteLocation(marker._id || marker.id)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        padding: '2px 6px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        lineHeight: '1'
                      }}
                      title="Remove this marker"
                    >
                      ✕
                    </button>
                  </div>
                  <div style={{ color: '#6c757d', lineHeight: '1.4' }}>
                    <div>📍 {marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)}</div>
                    <div style={{ marginTop: '2px' }}>🎯 {marker.description || 'No description'}</div>
                    <div style={{ marginTop: '4px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ backgroundColor: marker.color || '#999', color: 'white', padding: '2px 6px', borderRadius: '3px', fontSize: '11px' }}>
                        {marker.category || 'custom'}
                      </span>
                      {marker.ownerEmail && <span style={{ fontSize: '11px', color: '#555' }}>by {marker.ownerEmail}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Shop List */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>
            🏪 Shop Locations ({predefinedLocations.filter(loc => loc.type === 'shop').length})
          </h4>
          
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {predefinedLocations.filter(location => location.type === 'shop').map((shop) => (
              <div 
                key={shop.id} 
                onClick={() => handleShopClick(shop)}
                style={{ 
                  backgroundColor: '#f8f9fa', 
                  border: '1px solid #dee2e6', 
                  borderRadius: '4px', 
                  padding: '8px', 
                  marginBottom: '8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '4px'
                }}>
                  <strong style={{ color: '#495057' }}>
                    🏪 {shop.name}
                  </strong>
                  <span style={{
                    backgroundColor: shop.color,
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    lineHeight: '1'
                  }}>
                    Shop
                  </span>
                </div>
                <div style={{ color: '#6c757d', lineHeight: '1.3' }}>
                  <div>📍 {shop.position[0].toFixed(4)}, {shop.position[1].toFixed(4)}</div>
                  <div style={{ marginTop: '2px' }}> {shop.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MapContainer 
        center={selectedCity.position} 
        zoom={30} 
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <ChangeView center={selectedCity.position} zoom={30} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler
          key={`click-handler-${isClickToAddEnabled}-${isRoutingMode}`}
          onMapClick={handleMapClick}
          isClickToAddEnabled={isClickToAddEnabled || isRoutingMode}
        />

        {/* Routing Machine - only active when both points are set */}
        {routeStart && routeEnd && (
          <RoutingMachine waypoints={[routeStart, routeEnd]} />
        )}

        {/* Route start marker */}
        {routeStart && (
          <Marker
            position={routeStart}
            icon={L.icon({
              iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684815.png', // Green flag
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40]
            })}
          >
            <Popup>
              <strong>🚩 Route Start</strong><br/>
              {routeStart[0].toFixed(6)}, {routeStart[1].toFixed(6)}
            </Popup>
          </Marker>
        )}

        {/* Route end marker */}
        {routeEnd && (
          <Marker
            position={routeEnd}
            icon={L.icon({
              iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Red flag
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40]
            })}
          >
            <Popup>
              <strong>🏁 Route End</strong><br/>
              {routeEnd[0].toFixed(6)}, {routeEnd[1].toFixed(6)}
            </Popup>
          </Marker>
        )}

        {/* Pending location marker (click-to-add or My Location) */}
        {pendingLocation && (
          <Marker
            position={pendingLocation}
            icon={L.icon({
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
              iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })}
          >
            <Popup>
              <strong>📍 New Location</strong><br/>
              {pendingLocation[0].toFixed(6)}, {pendingLocation[1].toFixed(6)}<br/>
              <em>Fill in the form to save this location</em>
            </Popup>
          </Marker>
        )}

        {allMarkers.map(marker => (
          <Marker 
            key={marker.id} 
            position={marker.position}
            icon={createCustomIcon(marker.color, marker.type)}
            eventHandlers={{
              click: () => handleMarkerClick(marker)
            }}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <strong style={{ fontSize: '16px', color: '#333' }}>{marker.name}</strong>
                <br />
                <span style={{ 
                  display: 'inline-block', 
                  backgroundColor: marker.type === 'shop' ? '#4CAF50' : marker.type === 'preset' ? '#2196F3' : '#FF9800',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '12px',
                  marginTop: '5px'
                }}>
                  {marker.type === 'shop' ? 'Shop' : marker.type === 'preset' ? 'Preset Location' : 'Custom Marker'}
                </span>
                <br /><br />
                {marker.description && (
                  <>
                    <strong>Description:</strong> {marker.description}
                    <br /><br />
                  </>
                )}
                <strong>Location Details:</strong>
                <br />
                📍 Latitude: {marker.position[0].toFixed(6)}
                <br />
                📍 Longitude: {marker.position[1].toFixed(6)}
                <br />
                🎨 Color: {marker.color}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      </div>
    </>
  )
}

export default CombinedMap
