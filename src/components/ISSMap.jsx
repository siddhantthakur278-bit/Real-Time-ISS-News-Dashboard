import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom ISS Icon
const issIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3212/3212608.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const ISSMap = ({ latitude, longitude, path }) => {
  const position = [latitude, longitude];

  return (
    <div className="map-container">
      <MapContainer 
        center={position} 
        zoom={3} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={position} />
        
        {path.length > 1 && (
          <Polyline 
            positions={path} 
            color="#3b82f6" 
            weight={3} 
            opacity={0.7} 
            dashArray="5, 10"
          />
        )}

        <Marker position={position} icon={issIcon}>
          <Popup>
            <div style={{ textAlign: 'center' }}>
              <strong>ISS Current Position</strong><br />
              Lat: {latitude.toFixed(4)}<br />
              Lon: {longitude.toFixed(4)}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default ISSMap;
