import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiAlertCircle,
  FiCalendar,
  FiMapPin,
  FiFileText,
  FiLock,
  FiUploadCloud,
  FiArrowRight,
  FiNavigation,
  FiCheck,
  FiAlertTriangle,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import Navbar from "../../components/CitizenNavbar";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function RegisterCase() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [address, setAddress] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [crimeType, setCrimeType] = useState("");
  const [severity, setSeverity] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });
  const [description, setDescription] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState({
    status: null,
    message: "",
  });
  const [showBlurOption, setShowBlurOption] = useState(false);
  const [autoBlurEnabled, setAutoBlurEnabled] = useState(true);
  const [detectedContent, setDetectedContent] = useState([]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAJhahxWbFbZAulh7fmS-ANazqzHKOV09k&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Google Maps script");
      setMapLoaded(false);
    };
    document.head.appendChild(script);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationPermissionGranted(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          setCoordinates({ lat: 22.2587, lng: 71.1924 });
        }
      );
    }

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join("");

          if (event.results[0].isFinal) {
            setDescription((prev) => prev + " " + transcript);
            setInterimTranscript("");
          } else {
            setInterimTranscript(transcript);
          }
        };

        recognition.onerror = (event) => {
          setSpeechError("Error occurred in recognition: " + event.error);
          setIsListening(false);
        };

        recognition.onstart = () => {
          setIsListening(true);
          setSpeechError(null);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        return () => {
          recognition.stop();
        };
      } else {
        setSpeechError("Speech recognition not supported in this browser");
      }
    }
  }, []);

  useEffect(() => {
    if (mapLoaded && coordinates.lat && coordinates.lng) {
      const mapInstance = new window.google.maps.Map(
        document.getElementById("map"),
        {
          center: { lat: coordinates.lat, lng: coordinates.lng },
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }
      );

      const markerInstance = new window.google.maps.Marker({
        position: { lat: coordinates.lat, lng: coordinates.lng },
        map: mapInstance,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      });

      reverseGeocode(coordinates.lat, coordinates.lng);

      mapInstance.addListener("click", (e) => {
        const clickedLat = e.latLng.lat();
        const clickedLng = e.latLng.lng();

        markerInstance.setPosition({
          lat: clickedLat,
          lng: clickedLng,
        });

        setCoordinates({
          lat: clickedLat,
          lng: clickedLng,
        });

        reverseGeocode(clickedLat, clickedLng);
      });

      markerInstance.addListener("dragend", () => {
        const position = markerInstance.getPosition();
        const newLat = position.lat();
        const newLng = position.lng();

        setCoordinates({
          lat: newLat,
          lng: newLng,
        });

        reverseGeocode(newLat, newLng);
      });

      const input = document.getElementById("location-input");
      const searchBox = new window.google.maps.places.Autocomplete(input);
      searchBox.addListener("place_changed", () => {
        const place = searchBox.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        mapInstance.setCenter(place.geometry.location);
        markerInstance.setPosition(place.geometry.location);

        setCoordinates({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });

        setAddress(place.formatted_address);
      });

      setMap(mapInstance);
      setMarker(markerInstance);
    }
  }, [mapLoaded, coordinates.lat, coordinates.lng]);

  const reverseGeocode = async (lat, lng) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === "OK" && results[0]) {
        setAddress(results[0].formatted_address);
      } else {
        setAddress(`Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`);
      }
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setShowBlurOption(true);
    setDetectedContent([]);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImageWithSightEngine = async (file, shouldBlur) => {
    const formData = new FormData();
    formData.append("media", file);
    formData.append(
      "models",
      "nudity-2.1,weapon,alcohol,recreational_drug,medical,offensive-2.0,gore-2.0,violence,self-harm,gambling"
    );

    if (shouldBlur) {
      formData.append("blur", "15");
      formData.append("blur_types", "all");
    }

    try {
      const response = await axios.post(
        "https://api.sightengine.com/1.0/check.json",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          params: {
            api_user: "1043833218",
            api_secret: "CfztvLVuKWqyid9XwGQbAz5yiPdwfbmg",
          },
        }
      );

      const thresholds = {
        nudity: 0.7,
        weapon: 0.7,
        alcohol: 0.8,
        drugs: 0.8,
        offensive: 0.7,
        violence: 0.7,
        self_harm: 0.9,
        gambling: 0.8,
      };

      const flagged = Object.entries(thresholds)
        .filter(
          ([category]) =>
            (response.data[category]?.prob ?? 0) >= thresholds[category]
        )
        .map(([category]) => category);

      setDetectedContent(flagged);

      return {
        success: true,
        data: response.data,
        is_detected: flagged.length > 0,
        flagged_categories: flagged,
        blurred_image: shouldBlur ? response.data.image?.url : null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  };

  const processImage = async () => {
    if (!selectedFile) return null;

    const analysisResult = await analyzeImageWithSightEngine(
      selectedFile,
      autoBlurEnabled
    );

    if (!analysisResult.success) {
      throw new Error(`Image analysis failed: ${analysisResult.error}`);
    }

    // If we have a blurred image URL from Sightengine, fetch it
    let fileToUpload = selectedFile;
    if (analysisResult.blurred_image) {
      try {
        const response = await fetch(analysisResult.blurred_image);
        const blob = await response.blob();
        fileToUpload = new File([blob], selectedFile.name, {
          type: selectedFile.type,
        });

        // Update preview with blurred version
        const reader = new FileReader();
        reader.onload = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error fetching blurred image:", error);
      }
    }

    return {
      file: fileToUpload,
      analysis: analysisResult.data,
      is_detected: analysisResult.is_detected,
      flagged_categories: analysisResult.flagged_categories,
      is_blurred: autoBlurEnabled && analysisResult.is_detected,
    };
  };

  const uploadFile = async () => {
    const processedImage = await processImage();
    if (!processedImage) return null;

    const fileExt = processedImage.file.name.split(".").pop();
    const fileName = `${Math.random()
      .toString(36)
      .substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `evidence/${fileName}`;

    const { error } = await supabase.storage
      .from("incident-evidence")
      .upload(filePath, processedImage.file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("incident-evidence").getPublicUrl(filePath);

    return {
      url: publicUrl,
      analysis: processedImage.analysis,
      is_detected: processedImage.is_detected,
      flagged_categories: processedImage.flagged_categories,
      is_blurred: processedImage.is_blurred,
    };
  };

  const submitToSupabase = async (formData) => {
    try {
      let fileUrl = null;
      let mediaAnalysis = null;
      let isDetected = false;
      let flaggedCategories = [];
      let isBlurred = false;

      if (selectedFile) {
        const uploadResult = await uploadFile();
        fileUrl = uploadResult.url;
        mediaAnalysis = uploadResult.analysis;
        isDetected = uploadResult.is_detected;
        flaggedCategories = uploadResult.flagged_categories || [];
        isBlurred = uploadResult.is_blurred || false;
      }

      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .insert([
          {
            user_id: formData.userId,
            crime_type: formData.crimeType.toLowerCase(),
            isAnonymous: formData.isAnonymous,
            title: formData.title,
            address: formData.address,
            latitude: formData.coordinates.lat,
            longitude: formData.coordinates.lng,
            description: formData.description,
            severity: formData.severity.toLowerCase(),
            status: "pending",
            reported_at: formData.dateTime,
            updated_at: new Date().toISOString(),
            media_analysis: mediaAnalysis,
            is_detected: isDetected,
            flagged_categories: flaggedCategories,
            is_blurred: isBlurred,
          },
        ])
        .select();

      if (reportError) throw reportError;

      if (fileUrl && reportData && reportData.length > 0) {
        const reportId = reportData[0].id;
        const fileType = selectedFile.type.split("/")[0];

        const { error: mediaError } = await supabase
          .from("report_media")
          .insert([
            {
              report_id: reportId,
              file_url: fileUrl,
              file_type: fileType,
              uploaded_at: new Date().toISOString(),
              analysis_result: mediaAnalysis,
              is_detected: isDetected,
              flagged_categories: flaggedCategories,
              is_blurred: isBlurred,
            },
          ]);

        if (mediaError) throw mediaError;
      }

      return {
        success: true,
        data: reportData,
        message: "Report submitted successfully!",
      };
    } catch (error) {
      console.error("Error submitting to Supabase:", error);
      return {
        success: false,
        error: error.message || "Failed to submit report",
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus({ status: null, message: "" });

    if (
      !crimeType ||
      !dateTime ||
      !description ||
      !coordinates.lat ||
      !coordinates.lng ||
      !severity
    ) {
      setIsSubmitting(false);
      setSubmissionStatus({
        status: "error",
        message:
          "Please fill in all required fields and select a location on the map.",
      });
      return;
    }

    const formData = {
      userId: user?.id || null,
      isAnonymous,
      crimeType,
      severity,
      title,
      dateTime,
      coordinates,
      address,
      description,
      caseNumber,
    };

    try {
      const result = await submitToSupabase(formData);

      if (result.success) {
        setSubmissionStatus({
          status: "success",
          message: "Your incident report has been submitted successfully.",
        });

        setTimeout(() => {
          setCrimeType("");
          setSeverity("");
          setDateTime("");
          setDescription("");
          setCaseNumber("");
          setSelectedFile(null);
          setFilePreview(null);
          setShowBlurOption(false);
          navigate("/citizen-dashboard");
        }, 3000);
      } else {
        setSubmissionStatus({
          status: "error",
          message: `Failed to submit report: ${result.error}`,
        });
      }
    } catch (error) {
      setSubmissionStatus({
        status: "error",
        message: `An unexpected error occurred: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const centerOnUserLocation = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          map.setCenter(userLocation);
          marker.setPosition(userLocation);
          setCoordinates(userLocation);
          reverseGeocode(userLocation.lat, userLocation.lng);
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto p-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Report Incident
          </h1>
          <p className="text-gray-600 mb-8">
            Help keep your community safe by reporting incidents
          </p>

          {submissionStatus.status && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 mb-6 rounded-lg flex items-center gap-3 ${
                submissionStatus.status === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {submissionStatus.status === "success" ? (
                <FiCheck className="w-5 h-5" />
              ) : (
                <FiAlertTriangle className="w-5 h-5" />
              )}
              <span>{submissionStatus.message}</span>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl mb-8 transition-colors ${
              isAnonymous
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FiLock className="w-5 h-5" />
            <span className="font-medium">
              {isAnonymous ? "Reporting Anonymously" : "Report Anonymously"}
            </span>
          </motion.button>

          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div
              variants={formVariants}
              className="bg-gray-50 p-6 rounded-xl"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FiAlertCircle className="w-6 h-6 text-blue-600" />
                Incident Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter a brief title for the incident"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crime Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full pl-4 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                      value={crimeType}
                      onChange={(e) => setCrimeType(e.target.value)}
                      required
                    >
                      <option value="">Select crime type</option>
                      <option value="theft">Theft</option>
                      <option value="vandalism">Vandalism</option>
                      <option value="assault">Assault</option>
                      <option value="burglary">Burglary</option>
                      <option value="fraud">Fraud</option>
                      <option value="harassment">Harassment</option>
                      <option value="traffic">Traffic Incident</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full pl-4 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      required
                    >
                      <option value="">Select severity</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="datetime-local"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mb-4">
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      id="location-input"
                      type="text"
                      placeholder="Search for a location or address"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={address}
                      onChange={handleAddressChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
                      onClick={centerOnUserLocation}
                      title="Use current location"
                    >
                      <FiNavigation className="w-5 h-5" />
                    </button>
                  </div>
                  <div
                    id="map"
                    className="w-full h-64 rounded-lg border border-gray-300 overflow-hidden mb-2"
                  ></div>

                  {coordinates.lat && coordinates.lng && (
                    <div className="text-sm text-gray-600 flex gap-4">
                      <span>Latitude: {coordinates.lat.toFixed(6)}</span>
                      <span>Longitude: {coordinates.lng.toFixed(6)}</span>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiFileText className="absolute left-3 top-4 transform -translate-y-0 text-gray-400" />
                    <textarea
                      placeholder="Provide detailed description of the incident"
                      className="w-full pl-10 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      rows="4"
                      value={
                        description +
                        (interimTranscript ? " " + interimTranscript : "")
                      }
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!isListening) {
                          const recognition = new (window.SpeechRecognition ||
                            window.webkitSpeechRecognition)();
                          recognition.start();
                        }
                      }}
                      className={`absolute right-3 top-4 p-2 rounded-full ${
                        isListening
                          ? "text-red-600 animate-pulse"
                          : "text-gray-600 hover:text-blue-600"
                      } transition-colors`}
                      title={
                        isListening ? "Stop recording" : "Start voice input"
                      }
                      disabled={
                        !(
                          "SpeechRecognition" in window ||
                          "webkitSpeechRecognition" in window
                        )
                      }
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                    </button>
                  </div>
                  {speechError && (
                    <p className="text-red-500 text-sm mt-2">{speechError}</p>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={formVariants}
              className="bg-gray-50 p-6 rounded-xl"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FiUploadCloud className="w-6 h-6 text-blue-600" />
                Supporting Evidence
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Evidence
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*,video/*"
                    />
                    <label
                      htmlFor="file-upload"
                      className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-500 transition-colors cursor-pointer"
                    >
                      <FiUploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                      <span className="text-blue-600 font-medium">
                        Click to upload
                      </span>
                      <span className="text-sm text-gray-500 mt-1">
                        or drag and drop files here
                      </span>
                    </label>
                    {selectedFile && (
                      <>
                        <span className="block mt-2 text-sm text-gray-600">
                          Selected file: {selectedFile.name}
                        </span>
                        {filePreview && (
                          <div className="relative mt-2">
                            <img
                              src={filePreview}
                              alt="Preview"
                              className="max-h-64 rounded-lg border border-gray-200"
                            />
                            {detectedContent.length > 0 && (
                              <div className="mt-2 text-sm text-red-600">
                                Detected content: {detectedContent.join(", ")}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {showBlurOption && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {autoBlurEnabled ? (
                        <FiEyeOff className="w-5 h-5 text-blue-600" />
                      ) : (
                        <FiEye className="w-5 h-5 text-blue-600" />
                      )}
                      <span className="font-medium text-gray-700">
                        {autoBlurEnabled
                          ? "Sensitive content will be automatically blurred"
                          : "Sensitive content will remain visible"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoBlurEnabled(!autoBlurEnabled)}
                      className="px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      {autoBlurEnabled
                        ? "Disable Auto-Blur"
                        : "Enable Auto-Blur"}
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Police Case Number (FIR)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter official case number if available"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                  />
                </div>
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-medium hover:from-blue-700 hover:to-blue-600 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  Submit Report
                  <FiArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.main>
    </div>
  );
}
