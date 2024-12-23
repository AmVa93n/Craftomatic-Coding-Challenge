import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './MapPage.css';
import { Device } from '../../types';

export default function MapPage() {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    axios.get('/devices.json') // Fetch the device data from the static JSON file
      .then(response => {
        setDevices(response.data);
      })
      .catch(error => {
        console.error('Error fetching device data:', error);
      });
  }, []);

  return (
    <div className="map-page">
      <MapContainer center={[51.1657, 10.4515]} zoom={5} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {devices.map(device => (
          <Marker
            key={device.id}
            position={[device.latitude, device.longitude]}
            icon={L.icon({
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.0/images/marker-icon.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.0/images/marker-shadow.png',
                shadowSize: [41, 41]
            })}
          >
            <Popup>
              <div>
                <strong>ID:</strong> {device.id}<br />
                <strong>Type:</strong> {device.type}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};