"use client";

import dynamic from "next/dynamic";

const MapInner = dynamic(() => import("./PropertyMapInner"), {
  ssr: false,
  loading: () => <div className="flex h-72 items-center justify-center rounded-2xl bg-ice text-sm text-gray-muted">Carregando mapa...</div>,
});

export function PropertyMap({
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
  return <MapInner lat={lat} lng={lng} title={title} approximate={approximate} />;
}
