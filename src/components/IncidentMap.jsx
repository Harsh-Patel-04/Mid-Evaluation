// // Create a new component components/IncidentMap.jsx
// import { useEffect, useState } from "react";
// import { supabase } from "../lib/supabase";

// const IncidentMap = ({ incidents }) => {
//   const [map, setMap] = useState(null);
//   const [markers, setMarkers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const initMap = () => {
//       const map = new window.google.maps.Map(document.getElementById("map"), {
//         center: incidents[0]?.geometry || { lat: 40.7128, lng: -74.006 },
//         zoom: 12,
//         mapTypeControl: false,
//         streetViewControl: false,
//         fullscreenControl: false,
//       });

//       // Create markers for each incident
//       const newMarkers = incidents.map((incident) => {
//         return new window.google.maps.Marker({
//           position: { lat: incident.latitude, lng: incident.longitude },
//           map,
//           title: incident.title,
//           icon: {
//             path: window.google.maps.SymbolPath.CIRCLE,
//             fillColor: "#ff0000",
//             fillOpacity: 0.8,
//             strokeColor: "#ffffff",
//             strokeWeight: 2,
//             scale: 8,
//           },
//         });
//       });

//       setMarkers(newMarkers);
//       setMap(map);
//       setLoading(false);
//     };

//     if (!window.google) {
//       const script = document.createElement("script");
//       script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAJhahxWbFbZAulh7fmS-ANazqzHKOV09k`;
//       script.async = true;
//       script.defer = true;
//       script.onload = () => initMap();
//       script.onerror = () => setError("Failed to load Google Maps");
//       document.head.appendChild(script);
//     } else {
//       initMap();
//     }

//     return () => {
//       markers.forEach((marker) => marker.setMap(null));
//       const googleScript = document.querySelector(
//         'script[src^="https://maps.googleapis.com/maps/api/js"]'
//       );
//       if (googleScript) googleScript.remove();
//     };
//   }, [incidents]);

//   return (
//     <div className="h-96 relative">
//       {error && (
//         <div className="absolute inset-0 bg-white flex items-center justify-center text-red-600">
//           {error}
//         </div>
//       )}
//       {loading && (
//         <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
//           Loading map...
//         </div>
//       )}
//       <div id="map" className="h-full w-full rounded-xl" />
//     </div>
//   );
// };

// export default IncidentMap;

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const IncidentMap = () => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [incidents, setIncidents] = useState([]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "#10b981"; 
      case "pending":
        return "#f59e0b"; 
      case "under investigation":
        return "#3b82f6"; 
      default:
        return "#ef4444"; 
    }
  };

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const { data, error } = await supabase
          .from("reports")
          .select("*")
          .not("latitude", "is", null)
          .not("longitude", "is", null);

        if (error) throw error;
        setIncidents(data);
      } catch (err) {
        setError("Failed to load incidents");
        console.error(err);
      }
    };

    fetchIncidents();
  }, []);

  useEffect(() => {
    if (!incidents.length) return;

    const initMap = () => {
      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: {
          lat: Number(incidents[0].latitude),
          lng: Number(incidents[0].longitude),
        },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
      });

      const newMarkers = incidents.map((incident) => {
        const marker = new window.google.maps.Marker({
          position: {
            lat: Number(incident.latitude),
            lng: Number(incident.longitude),
          },
          map,
          title: incident.title,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: getStatusColor(incident.status),
            fillOpacity: 0.9,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            scale: 8,
          },
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="text-sm">
              <h3 class="font-semibold">${incident.title}</h3>
              <p>Type: ${incident.crime_type}</p>
              <p>Status: <span class="font-medium">${incident.status}</span></p>
              <p>Reported: ${new Date(
                incident.reported_at
              ).toLocaleDateString()}</p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        return marker;
      });

      setMarkers(newMarkers);
      setMap(map);
      setLoading(false);
    };

    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAJhahxWbFbZAulh7fmS-ANazqzHKOV09k`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => setError("Failed to load Google Maps");
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      markers.forEach((marker) => marker.setMap(null));
      const googleScript = document.querySelector(
        'script[src^="https://maps.googleapis.com/maps/api/js"]'
      );
      if (googleScript) googleScript.remove();
    };
  }, [incidents]);

  return (
    <div className="h-96 relative">
      {error && (
        <div className="absolute inset-0 bg-white flex items-center justify-center text-red-600">
          {error}
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          Loading crime map...
        </div>
      )}
      <div id="map" className="h-full w-full rounded-xl" />
    </div>
  );
};

export default IncidentMap;
