import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapProps {
  quests: any[];
  center: [number, number];
  userLocation: [number, number] | null;
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

const Map = ({ quests, center, userLocation }: MapProps) => {

  const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="w-full h-full">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
          className="red-labels-layer"
        />
        <RecenterMap center={center} />
        
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>
              <div>
                <strong>You are here</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {quests.map((quest: any) => {
          if (!quest.location || !quest.location.coordinates) return null;
          const position: [number, number] = [
            quest.location.coordinates[1],
            quest.location.coordinates[0]
          ];
          
          return (
            <Marker key={quest._id} position={position} icon={redIcon}>
              <Popup>
                <div>
                  <strong>{quest.title}</strong>
                  <p style={{ fontSize: '14px', marginTop: '4px' }}>{quest.description}</p>
                  <p style={{ fontSize: '12px', marginTop: '8px', fontWeight: 'bold' }}>+{quest.xpReward} XP</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;
