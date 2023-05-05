/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/** @jsxImportSource jotai-signal */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import maplibregl, { type Map } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

const MapLibre = () => {
  const mapContainer = useRef<HTMLDivElement>(null!);
  const map = useRef<Map>(null!);

  const [lat] = useState(41.09);
  const [lng] = useState(28.98);
  const [zoom] = useState(14);

  const goalpointMarkerIcon = document.createElement("div");

  goalpointMarkerIcon.setAttribute("class", "bg-transparent");

  goalpointMarkerIcon.innerHTML = `
        <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 56.57 56.57"
        height="32px"
        width="32px"
        >
        <defs>
        <style>
        .cls-1 {
        fill: #2bd1e5;
        }
        
        .cls-2 {
        fill: #ffffff;
        opacity: 0.4;
        }
        </style>
        </defs>
        <g id="Layer_1-2" data-name="Layer 1">
        <circle class="cls-2" cx="28.28" cy="28.28" r="28.28"/>
        <path d="M28.28,11.01l-12,34.55,11.92-5.81,12.08,5.81L28.28,11.01Z" class="cls-1"/>
        </g>
        </svg>
    `;

  const goalpointMarker = new maplibregl.Marker({
    element: goalpointMarkerIcon,
    anchor: "bottom",
    scale: 1.5,
  }).setLngLat([28.98, 41.09]);

  goalpointMarker.setRotationAlignment("map");

  useEffect(() => {
    if (map.current) return;
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      //   style: "https://tiles.stadiamaps.com/styles/outdoors.json ",
      style: "https://tiles.stadiamaps.com/styles/osm_bright.json",

      // style: {
      //   version: 8,
      //   sources: {
      //     "raster-tiles": {
      //       type: "raster",
      //       tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      //       tileSize: 256,
      //     },
      //   },
      //   layers: [
      //     {
      //       id: "simple-tiles",
      //       type: "raster",
      //       source: "raster-tiles",
      //       minzoom: 0,
      //       maxzoom: 22,
      //     },
      //   ],
      // },

      //   style:
      // "https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL",

      //   style: "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json",
      //   style:
      // "https://api.maptiler.com/maps/topo/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL",
      center: [lng, lat],
      zoom: zoom,
      pitchWithRotate: false,
    });
    goalpointMarker.addTo(map.current);
  });

  return (
    <div className="map-wrap min-h-screen">
      <div ref={mapContainer} className="map"></div>
    </div>
  );
};

export default MapLibre;
