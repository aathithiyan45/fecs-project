import React, { useState, useEffect } from 'react';
import { FaSave, FaBroadcastTower } from 'react-icons/fa';
import { MapContainer, TileLayer, Circle, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getBaseStations, createBaseStation } from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({ click(e) { onLocationSelect(e.latlng); } });
  return null;
}

function NetworkPlanner() {
  const [stations, setStations] = useState([]);
  const [draftLocation, setDraftLocation] = useState(null);
  const [formData, setFormData] = useState({ name: '', radius_meters: 15000 });

  useEffect(() => { fetchStations(); }, []);

  const fetchStations = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = await getBaseStations(token);
      setStations(data);
    } catch (error) { console.error('Error fetching base stations', error); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!draftLocation) return;
    try {
      const token = localStorage.getItem('token');
      await createBaseStation({ name: formData.name, latitude: draftLocation.lat, longitude: draftLocation.lng, radius_meters: Number(formData.radius_meters) }, token);
      setDraftLocation(null);
      setFormData({ name: '', radius_meters: 15000 });
      fetchStations();
      alert('Base Station Deployed Successfully!');
    } catch (error) { alert('Error deploying station. Name might be taken.'); }
  };

  return (
    <div className="planner-panel">
      <div className="section-title-bar"><h2>Network Infrastructure Planner</h2></div>
      <div className="admin-content" style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 110px)' }}>
        <div style={{ width: '280px', backgroundColor: '#1e2333', padding: '20px', borderRadius: '10px', overflowY: 'auto', border: '1px solid #2a2f40' }}>
          <h2 style={{ color: '#e8eaf0', marginBottom: '16px', fontSize: '1rem' }}>Deployed Stations</h2>
          {stations.length === 0 ? <p style={{ color: '#8892a4' }}>No stations deployed.</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {stations.map(st => (
                <li key={st.id} style={{ padding: '10px', borderBottom: '1px solid #2a2f40', color: '#e8eaf0' }}>
                  <strong><FaBroadcastTower style={{ color: '#22c55e' }} /> {st.name}</strong><br />
                  <small style={{ color: '#8892a4' }}>Radius: {st.radius_meters / 1000}km</small>
                </li>
              ))}
            </ul>
          )}
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#22c55e' }}>How to Deploy</h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#8892a4' }}>Click anywhere on the map to place a new base station coverage zone.</p>
          </div>
        </div>
        <div style={{ flex: 1, position: 'relative', borderRadius: '10px', overflow: 'hidden', border: '1px solid #2a2f40' }}>
          <MapContainer center={[10.8050, 78.6856]} zoom={10} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler onLocationSelect={setDraftLocation} />
            {stations.map(st => (
              <Circle key={st.id} center={[st.latitude, st.longitude]} radius={st.radius_meters} pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.2, interactive: false }}>
                <Popup><strong>{st.name}</strong><br />Coverage: {st.radius_meters / 1000}km</Popup>
              </Circle>
            ))}
            {draftLocation && (
              <Circle center={[draftLocation.lat, draftLocation.lng]} radius={formData.radius_meters} pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.4, dashArray: '5, 5', interactive: false }} />
            )}
          </MapContainer>
          {draftLocation && (
            <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000, backgroundColor: '#1e2333', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', width: '280px', border: '1px solid #2a2f40' }}>
              <h3 style={{ marginTop: 0, color: '#e8eaf0', fontSize: '1rem', marginBottom: '16px' }}>Deploy New Station</h3>
              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.75rem', color: '#8892a4', textTransform: 'uppercase' }}>Station Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. North Ridge" style={{ width: '100%', padding: '8px', borderRadius: '4px' }} />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.75rem', color: '#8892a4', textTransform: 'uppercase' }}>Radius (Meters)</label>
                  <input required type="number" step="1000" min="1000" value={formData.radius_meters} onChange={e => setFormData({ ...formData, radius_meters: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setDraftLocation(null)} style={{ flex: 1, padding: '9px', backgroundColor: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: '9px', backgroundColor: 'rgba(34,197,94,0.15)', color: '#86efac', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '4px', cursor: 'pointer' }}><FaSave /> Save</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NetworkPlanner;