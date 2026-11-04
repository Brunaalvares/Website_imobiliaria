"use client";

import { MapContainer, TileLayer, Circle, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function PropertyMapInner({
  lat,
  lng,
  title,
  approximate,
}: {
  lat: number;
  lng: number;
  title: string;
  approximate: boolean;
}) {
  return (
    <div className="h-72 overflow-hidden rounded-2xl border border-gray-light">
      <MapContainer center={[lat, lng]} zoom={approximate ? 14 : 16} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {approximate ? (
          <Circle center={[lat, lng]} radius={450} pathOptions={{ color: "#102A43", fillColor: "#102A43", fillOpacity: 0.15 }} />
        ) : (
          <Marker position={[lat, lng]} icon={icon}>
            <Popup>{title}</Popup>
          </Marker>
        )}
      </MapContainer>
      {approximate ? (
        <p className="border-t border-gray-light bg-white px-4 py-2 text-xs text-gray-muted">
          Localização aproximada para preservar a privacidade do imóvel.
        </p>
      ) : null}
    </div>
  );
}
