"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import type { Cat } from "@/types";
import CatCard from "@/components/CatCard";

type MapComponentProps = {
  cats: Cat[];
  selectedLocation: { lat: number; lng: number } | null;
  center: { lat: number; lng: number };
  onMapClick: (coords: { lat: number; lng: number }) => void;
};

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const selectedIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -34],
  shadowSize: [45, 45]
});

function ClickListener({ onMapClick }: { onMapClick: (coords: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(event) {
      onMapClick({ lat: event.latlng.lat, lng: event.latlng.lng });
    }
  });
  return null;
}

function FlyToLocation({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], map.getZoom(), { duration: 0.75 });
  }, [center.lat, center.lng, map]);
  return null;
}

export default function MapComponent({ cats, selectedLocation, center, onMapClick }: MapComponentProps) {
  const mapCenter = useMemo<[number, number]>(() => [center.lat, center.lng], [center.lat, center.lng]);

  return (
    <MapContainer center={mapCenter} zoom={12} className="z-0 h-screen w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToLocation center={center} />
      <ClickListener onMapClick={onMapClick} />
      {cats.map((cat) => (
        <Marker key={cat.id} position={[cat.lat, cat.lng]} icon={defaultIcon}>
          <Popup>
            <CatCard cat={cat} />
          </Popup>
        </Marker>
      ))}
      {selectedLocation ? (
        <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={selectedIcon}>
          <Popup>Selected report location</Popup>
        </Marker>
      ) : null}
    </MapContainer>
  );
}
