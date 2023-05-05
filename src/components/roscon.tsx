/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/** @jsxImportSource jotai-signal */

import { atom, useAtomValue } from "jotai";
import { $, atomSignal } from "jotai-signal";
import { RosConnection, Subscriber } from "rosreact";
import proj4 from "proj4";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const Test = dynamic(() => import("~/components/map"), { ssr: false });

export interface IAwapiVehicleGetStatus {
  header: {
    stamp: {
      sec: number;
      nsec: number;
    };
    frame_id: string;
  };
  pose: {
    position: { x: number; y: number; z: number };
    orientation: { x: number; y: number; z: number; w: number };
  };
  eulerangle: {
    roll: number;
    pitch: number;
    yaw: number;
  };
  geo_point: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  velocity: number;
  acceleration: number;
  steering: number;
  steering_velocity: number;
  angular_velocity: number;
  gear: number;
  energy_level: number;
  turn_signal: number;
  target_velocity: number;
  target_acceleration: number;
  target_steering: number;
  target_steering_velocity: number;
}

export type RosTime = Time;
export type Time = {
  sec: number;
  nsec: number;
};
export type Header = {
  frame_id: string;
  stamp: RosTime;
  seq?: number;
};
export type Orientation = {
  x: number;
  y: number;
  z: number;
  w: number;
};
export type Vector3 = {
  x: number;
  y: number;
  z: number;
};
export type Point = Vector3;

export type Pose = {
  position: Point;
  orientation: Orientation;
};
export interface PathPoint {
  /**
   * @description Represents a pose from a lanelet map, contains twist information.
   */

  pose: Pose;
  longitudinal_velocity_mps: number;
  lateral_velocity_mps: number;
  heading_rate_rps: number;
  is_final: boolean;
}

export type MapMetaData = {
  map_load_time: RosTime;
  resolution: number;
  width: number;
  height: number;
  origin: Pose;
};
export type OccupancyGrid = {
  header: Header;
  info: MapMetaData;
  data: Int8Array | number[];
};
export interface Path {
  /**
   * @description Contains a PathPoint path and an OccupancyGrid of drivable_area.
   */
  header: Header;
  points: PathPoint[];
  drivable_area: OccupancyGrid;
}

export const vehicleStatus = atomSignal({});

export const pathData = atomSignal<Path>({
  header: {
    frame_id: "",
    stamp: {
      sec: 0,
      nsec: 0,
    },
  },
  points: [],
  drivable_area: {
    header: {
      frame_id: "",
      stamp: {
        sec: 0,
        nsec: 0,
      },
    },
    info: {
      map_load_time: {
        sec: 0,
        nsec: 0,
      },
      resolution: 0,
      width: 0,
      height: 0,
      origin: {
        position: {
          x: 0,
          y: 0,
          z: 0,
        },
        orientation: {
          x: 0,
          y: 0,
          z: 0,
          w: 0,
        },
      },
    },
    data: [],
  },
});

export const RosCon = () => {
  //   const [message, SetMessage] = useState("meow");
  console.log("rerendered");

  //   const setAwapiVehicleStatus = useSetAtom(vehicleStatus);

  return (
    <div>
      <RosConnection url="ws://localhost:9090" autoConnect>
        <Subscriber
          topic="/awapi/vehicle/get/status"
          messageType="tier4_api_msgs/msg/AwapiVehicleStatus"
          queueSize={1}
          queueLength={1}
          customCallback={(msg) => {
            const vehicleStatuss = msg as IAwapiVehicleGetStatus;
            // @ts-ignore
            $(vehicleStatus).value = msg;

            // console.log(vehicleStatuss.geo_point);
          }}
        />
        <Subscriber
          topic="/planning/scenario_planning/lane_driving/behavior_planning/path"
          queueSize={1}
          queueLength={1}
          messageType="autoware_auto_planning_msgs/msg/Path"
          customCallback={(msg) => {
            const path = msg as Path;
            // @ts-ignore
            $(pathData).value = path;

            const { points } = path;

            const pathPoints = points.map((point) => {
              const { pose } = point;
              const { position } = pose;
              const { x, y, z } = position;
              return [x, y, z];
            });

            // console.log(pathPoints);

            const mgrsCrs =
              "+proj=tmerc +lat_0=0 +lon_0=3 +k=0.9996 +x_0=500000 +y_0=0 +ellps=bessel +units=m +no_defs";
            const latlongcrs =
              "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

            // const [longitude, latitude] = proj4(
            //   mgrsCrs,
            //   latlongcrs,
            //   pathPoints[0]?.flat()
            // );

            //  get long lat of all points
            const longLatPoints = pathPoints.map((point) => {
              const [longitude, latitude] = proj4(
                mgrsCrs,
                latlongcrs,
                point.flat()
              );
              return [longitude, latitude];
            });

            // console.log(path.points[0]?.pose.position);

            // log long lat of all points

            // longLatPoints.forEach((point) => {
            // console.log(point);
            // });
          }}
        />
      </RosConnection>
      <div>
        {/* @ts-ignore */}
        {/* {$(atom((get) => get(vehicleStatus).velocity))} km -- {Math.random()} */}
      </div>
      <div className="h-screen bg-gray-200">
        <Test />
      </div>
    </div>
  );
};
