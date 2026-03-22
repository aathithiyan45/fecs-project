import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const getMarkerColor = (messageType) => {
  switch (messageType) {
    case 'emergency': return 'red';
    case 'high': return 'orange';
    case 'normal': return 'green';
    default: return 'blue';
  }
};

const createColoredIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [25, 25],
  });
};

function FitBounds({ station }) {
  const map = useMap();
  useEffect(() => {
    // We only enforce strict operator bounds if they are assigned a station
    if (station && station.id) {
      const radiusKm = station.radius_meters / 1000;
      const latOffset = radiusKm / 111.32;
      const lngOffset = radiusKm / (111.32 * Math.cos(station.latitude * Math.PI / 180));
      
      const bounds = L.latLngBounds(
        [station.latitude - latOffset, station.longitude - lngOffset],
        [station.latitude + latOffset, station.longitude + lngOffset]
      );
      
      // 1. Initial framing
      map.fitBounds(bounds, { padding: [10, 10] });
      
      // 2. Hard lock the operator's camera bounds to this exact box
      map.setMaxBounds(bounds);
      map.options.maxBoundsViscosity = 1.0;
    } else {
      // Remove constraints if no station is assigned (e.g., admin map view)
      map.setMaxBounds(null);
    }
  }, [station?.id, map]); 
  return null;
}

function Map({ alerts, baseStation }) {
  // If no base station is assigned, default to looking at Trichy
  const center = baseStation 
    ? [baseStation.latitude, baseStation.longitude] 
    : (alerts.length > 0 ? [alerts[0].latitude, alerts[0].longitude] : [10.8050, 78.6856]);

  return (
    <MapContainer 
      center={center} 
      zoom={baseStation ? 13 : 10} 
      className="map"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <FitBounds station={baseStation} />
      
      {/* Draw the massive transparent green radio coverage area */}
      {baseStation && (
        <Circle
          center={[baseStation.latitude, baseStation.longitude]}
          radius={baseStation.radius_meters}
          pathOptions={{ color: '#2e7d32', fillColor: '#4caf50', fillOpacity: 0.15, weight: 3, interactive: false }}
        />
      )}
      
      {alerts.map((alert) => {
        // Check if the hardware is transmitting from completely outside our physical base station range
        const isOutOfBounds = baseStation 
          ? L.latLng(alert.latitude, alert.longitude).distanceTo(L.latLng(baseStation.latitude, baseStation.longitude)) > baseStation.radius_meters
          : false;

        return (
          <Marker
            key={alert.id}
            position={[alert.latitude, alert.longitude]}
            icon={createColoredIcon(isOutOfBounds ? '#ffeb3b' : getMarkerColor(alert.message_type))}
          >
            <Popup>
              <div>
                <strong>Device: {alert.device_id}</strong><br />
                Type: {alert.message_type}<br />
                Status: {alert.status}<br />
                Time: {new Date(alert.event_time).toLocaleString()}
                {isOutOfBounds && (
                  <div style={{ marginTop: '8px', color: '#d32f2f', fontWeight: 'bold', fontSize: '13px' }}>
                    <span role="img" aria-label="warning">⚠️</span> SENSOR OUT OF BOUNDS
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default Map;
