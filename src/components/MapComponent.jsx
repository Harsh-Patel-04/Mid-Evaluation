import { useState, useEffect, useRef, useMemo } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { GOOGLE_MAPS_CONFIG } from "../config/maps";

const MapComponent = () => {
  const [center, setCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markers, setMarkers] = useState([]);
  const mapRef = useRef(null);


  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["marker"],
    version: "beta",
  });

  if (loadError) {
    return <div>Error loading maps: {loadError.message}</div>;
  }
  const mapContainerStyle = useMemo(
    () => ({
      width: "100%",
      height: "400px",
    }),
    []
  );

  const defaultCenter = useMemo(
    () => ({
      lat: 28.6139, 
      lng: 77.209,
    }),
    []
  );

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          setError("Location access denied. Using default location.");
          setCenter(defaultCenter);
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setCenter(defaultCenter);
      setLoading(false);
    }
  }, [defaultCenter]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    markers.forEach((marker) => {
      marker.map = null;
    });

    const newMarkers = [
      new window.google.maps.marker.AdvancedMarkerElement({
        position: center || defaultCenter,
        map: mapRef.current,
        title: "Your Location",
      }),
    ];

    setMarkers(newMarkers);

    return () => {
      newMarkers.forEach((marker) => {
        marker.map = null;
      });
    };
  }, [isLoaded, center, defaultCenter]);

  if (loading || !isLoaded) {
    return <div className="p-4 text-center">Loading map...</div>;
  }

  return (
    <div className="rounded-lg overflow-hidden shadow-lg">
      {error && <div className="text-red-500 p-2">{error}</div>}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center || defaultCenter}
        zoom={13}
        onLoad={(map) => {
          mapRef.current = map;
        }}
      />
    </div>
  );
};

export default MapComponent;
