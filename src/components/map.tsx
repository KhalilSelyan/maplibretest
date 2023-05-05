/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { DivIcon } from "leaflet";
import { MapContainer, Marker, Polyline, TileLayer } from "react-leaflet";
import { $ } from "jotai-signal";
import {
  type Path,
  pathData,
  vehicleStatus,
  type IAwapiVehicleGetStatus,
} from "./roscon";
import { useEffect, useMemo, useState } from "react";
import proj4 from "proj4";
import { useAtomValue } from "jotai";
import { MGRS, UTM } from "@ngageoint/mgrs-js";

const Map = () => {
  const mgrs1 = useMemo(() => {
    // return "+proj=utm +lat_0=0 +lon_0=3 +k=0.9996 +x_0=500000 +y_0=0 +ellps=bessel +units=m +no_defs";
    // return "+proj=tmerc +lat_0=0 +lon_0=15.80827777777778 +k=1 +x_0=1500000 +y_0=0 +ellps=bessel +units=m +no_defs";
    return "+proj=utm +zone=35 +to_meter +ellps=WGS84 +datum=WGS84 +approx +units=m +no_defs";
  }, []);

  const latlong = useMemo(() => {
    return "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
  }, []);

  const vehicleStatuss = useAtomValue<IAwapiVehicleGetStatus>(vehicleStatus);

  const paths = useAtomValue<Path>(pathData);

  const [latlongPoints, setLatlongPoints] = useState<(number | undefined)[][]>(
    []
  );
  useEffect(() => {
    if (paths && paths !== null) {
      const { points } = paths;

      const pathPoints = points.map((point) => {
        const { pose } = point;
        const { position } = pose;
        const { x, y, z } = position;
        return [x, y, z];
      });
      // console.log("pathPoints", pathPoints);

      const longLatPoints = pathPoints.map((point) => {
        // const [longitude, latitude] = proj4(latlong, point.flat());

        const [longitude, latitude] = proj4(mgrs1, latlong).forward(
          point.flat().slice(0, 2)
        );

        return [latitude, longitude];
      });

      if (longLatPoints !== undefined && longLatPoints !== null) {
        // console.log(longLatPoints);

        setLatlongPoints(longLatPoints);
      }
    }

    // console.log("vehicleStatuss", vehicleStatuss.geo_point);
  }, [paths, vehicleStatuss]);

  return (
    <div>
      <MapContainer
        style={{
          userSelect: "none",
          height: "100vh",
        }}
        // center={[
        //   vehicleStatuss?.geo_point?.latitude,
        //   vehicleStatuss?.geo_point?.longitude,
        // ]}
        center={[41.0287, 28.9769]}
        zoom={14}
        attributionControl={false}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // minZoom={14}
        />
        <Marker
          position={[3, 3]}
          // position={[
          //   vehicleStatuss?.geo_point?.latitude,
          //   vehicleStatuss?.geo_point?.longitude,
          // ]}
          icon={
            new DivIcon({
              className: "bg-transparent",
              html: `<div style="background-color: red; width: 5px; height: 5px; border-radius: 50%;"></div>`,
            })
          }
        />
        <Polyline
          pathOptions={{
            color: "hotpink",
            weight: 10,
          }}
          positions={latlongPoints as [number, number][]}
        />
      </MapContainer>
    </div>
  );
};

export default Map;
