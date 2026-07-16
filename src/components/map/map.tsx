"use client";

import {
  APIProvider,
  Map,
  Circle,
  Marker,
} from "@vis.gl/react-google-maps";

type PropertyMapProps = {
  lat: number;
  lng: number;
  zoom?: number;
  height?: string;
};

export default function PropertyMap({
  lat,
  lng,
  zoom = 15,
  height = "300px",
}: PropertyMapProps) {
  const position = { lat, lng };

  return (
    <div
      className="w-full rounded-xl overflow-hidden border"
      style={{ height }}
    >
      <APIProvider
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}
      >
        <Map
          style={{ width: "100%", height: "100%" }}
          defaultCenter={position}
          defaultZoom={zoom}
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          {/*<AdvancedMarker position={position}>
            <Pin
              background="#111827"
              glyphColor="#ffffff"
              borderColor="#ffffff"
            />
          </AdvancedMarker>*/}
          <Marker position={position} title="" />
          <Circle
            center={{ lat: lat, lng: lng }}
            radius={100}
            fillColor={"#0088ff"}
            fillOpacity={0.3}
            strokeColor={"#0088ff"}
            strokeWeight={2}
          />
        </Map>
      </APIProvider>
    </div>
  );
}
