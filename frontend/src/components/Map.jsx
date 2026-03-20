import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

function Map({ alerts }) {
  const center = alerts.length > 0 
    ? [alerts[0].latitude, alerts[0].longitude]
    : [10.9347, 78.1212]; // Default center

  return (
    <MapContainer center={center} zoom={13} className="map">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {alerts.map((alert) => (
        <Marker
          key={alert.id}
          position={[alert.latitude, alert.longitude]}
          icon={createColoredIcon(getMarkerColor(alert.message_type))}
        >
          <Popup>
            <div>
              <strong>Device: {alert.device_id}</strong><br />
              Type: {alert.message_type}<br />
              Status: {alert.status}<br />
              Time: {new Date(alert.event_time).toLocaleString()}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default Map;
