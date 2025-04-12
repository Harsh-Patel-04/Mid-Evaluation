import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiAlertTriangle,
  FiMap,
  FiFilter,
  FiCalendar,
  FiCheckSquare,
  FiShield,
  FiTruck,
  FiHome,
  FiAlertCircle,
  FiBell,
  FiBarChart2,
  FiPieChart,
} from "react-icons/fi";
import Navbar from "../../components/CitizenNavbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import IncidentMap from "../../components/IncidentMap";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, type: "spring", stiffness: 80 },
  }),
};

export default function Dashboard() {
  const { isLoggedIn } = useAuth();
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const LIBRARIES = ["visualization"];
  const GOOGLE_MAPS_API_KEY = "AIzaSyAUZwzaEsPjMu4CbgC86Fi-wRE_KyX7-SE";
  const [filters, setFilters] = useState({
    types: [],
    severity: [],
    verifiedOnly: false,
  });
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null,
  });
  const [timeRange, setTimeRange] = useState("7days");

  const incidentTypes = [
    { id: 1, name: "theft", icon: FiHome, color: "yellow" },
    { id: 2, name: "assault", icon: FiAlertTriangle, color: "red" },
    { id: 3, name: "vandalism", icon: FiShield, color: "blue" },
    { id: 4, name: "fraud", icon: FiTruck, color: "green" },
    { id: 5, name: "other", icon: FiAlertCircle, color: "purple" },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch total reports count
      const { count: totalIncidents } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true });

      // Fetch recent incidents (last 10)
      const { data: recentIncidents } = await supabase
        .from("reports")
        .select("*")
        .order("reported_at", { ascending: false })
        .limit(10);

      // Fetch crime statistics by type
      const { data: statsData } = await supabase
        .from("crime_statistics")
        .select("crime_type, total_reports");

      // Process stats into the format we need
      const stats = {
        theft: 0,
        assault: 0,
        vandalism: 0,
        fraud: 0,
        other: 0,
      };

      statsData.forEach((item) => {
        stats[item.crime_type] = item.total_reports;
      });

      // Calculate time-based stats
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);

      // Fetch reports for different time ranges
      const { data: weekData } = await supabase
        .from("reports")
        .select("crime_type")
        .gte("reported_at", sevenDaysAgo.toISOString());

      const { data: monthData } = await supabase
        .from("reports")
        .select("crime_type")
        .gte("reported_at", thirtyDaysAgo.toISOString());

      // Process time stats
      const processTimeStats = (data) => {
        const counts = {
          theft: 0,
          assault: 0,
          vandalism: 0,
          fraud: 0,
          other: 0,
        };
        data.forEach((item) => counts[item.crime_type]++);

        const total = data.length;
        const mostCommon = Object.entries(counts).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )[0];

        const categories = Object.entries(counts).map(([name, count]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }));

        const topTypes = Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        return { total, mostCommon, categories, topTypes };
      };

      const timeStats = {
        "7days": processTimeStats(weekData),
        "30days": processTimeStats(monthData),
        year: {
          total: totalIncidents,
          mostCommon: Object.entries(stats).reduce((a, b) =>
            a[1] > b[1] ? a : b
          )[0],
          categories: Object.entries(stats).map(([name, count]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            percentage:
              totalIncidents > 0
                ? Math.round((count / totalIncidents) * 100)
                : 0,
          })),
          topTypes: Object.entries(stats)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5),
        },
      };

      setLiveData({
        totalIncidents,
        recentIncidents: recentIncidents.map((incident) => ({
          id: incident.id,
          type: incident.title,
          category: incident.crime_type,
          date: new Date(incident.reported_at).toLocaleString(),
          location: incident.address || "Unknown location",
          verified: incident.status === "resolved",
          severity: incident.severity,
        })),
        stats,
        timeStats,
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error fetching live data");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();

      // Setup realtime subscription for reports table
      const reportsSubscription = supabase
        .channel("reports_changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "reports" },
          (payload) => {
            fetchData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(reportsSubscription);
      };
    }
  }, [isLoggedIn]);

  const toggleFilter = (category, value) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
    }));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow p-8 flex items-center justify-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl text-gray-700 bg-white p-8 rounded-xl shadow-lg"
          >
            Please log in to access the Dashboard
          </motion.p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow p-8 space-y-8 max-w-7xl mx-auto w-full">
        <motion.header
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold text-gray-800">Safety Dashboard</h1>
          <p className="text-gray-600 text-lg">
            Community Incident Reporting and Analytics
          </p>
        </motion.header>

        {loading ? (
          <motion.div
            className="text-xl text-gray-700 bg-white p-6 rounded-xl shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Loading live data...
          </motion.div>
        ) : error ? (
          <motion.div
            className="text-red-600 text-xl bg-white p-6 rounded-xl shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Filters Section */}
            <motion.section
              initial="hidden"
              animate="visible"
              custom={2}
              variants={containerVariants}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <div className="flex items-center gap-3 mb-6">
                <FiMap className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Incident Map
                </h2>
              </div>
              <IncidentMap />
            </motion.section>
            
            <motion.section
              initial="hidden"
              animate="visible"
              custom={1}
              variants={containerVariants}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <div className="flex items-center gap-3 mb-6">
                <FiFilter className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Filters</h2>
                <button
                  onClick={() =>
                    setFilters({ types: [], severity: [], verifiedOnly: false })
                  }
                  className="ml-auto text-blue-600 hover:text-blue-700"
                >
                  Reset
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {incidentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => toggleFilter("types", type.name)}
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      filters.types.includes(type.name)
                        ? `bg-${type.color}-100 border-${type.color}`
                        : "bg-gray-100 border-transparent"
                    } border-2 transition-all`}
                  >
                    <type.icon className={`w-5 h-5 text-${type.color}-600`} />
                    <span className="font-medium">
                      {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <span className="font-medium">Severity:</span>
                  {["low", "medium", "high"].map((level) => (
                    <button
                      key={level}
                      onClick={() => toggleFilter("severity", level)}
                      className={`px-4 py-2 rounded-lg ${
                        filters.severity.includes(level)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 ml-auto">
                  <FiCheckSquare className="w-5 h-5 text-gray-600" />
                  <input
                    type="checkbox"
                    checked={filters.verifiedOnly}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        verifiedOnly: e.target.checked,
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">Verified reports only</span>
                </label>
              </div>
            </motion.section>

            {/* Map Section */}
            {/* Recent Incidents */}
            <motion.section
              initial="hidden"
              animate="visible"
              custom={3}
              variants={containerVariants}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FiBell className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Recent Incidents
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-5 h-5 text-gray-600" />
                    <input
                      type="date"
                      className="bg-gray-100 p-2 rounded-lg"
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          start: e.target.value,
                        }))
                      }
                    />
                    <span>to</span>
                    <input
                      type="date"
                      className="bg-gray-100 p-2 rounded-lg"
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          end: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <span className="text-gray-600">
                    Showing {liveData.recentIncidents.length} of{" "}
                    {liveData.totalIncidents} incidents
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {liveData.recentIncidents
                    .filter((incident) => {
                      if (
                        filters.types.length > 0 &&
                        !filters.types.includes(incident.category)
                      ) {
                        return false;
                      }
                      if (
                        filters.severity.length > 0 &&
                        !filters.severity.includes(incident.severity)
                      ) {
                        return false;
                      }
                      if (filters.verifiedOnly && !incident.verified) {
                        return false;
                      }
                      return true;
                    })
                    .map((incident) => (
                      <motion.div
                        key={incident.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-600 flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-lg">
                              {incident.type}
                            </span>
                            <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                              {incident.category}
                            </span>
                            {incident.verified && (
                              <FiCheckSquare className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {incident.date} • {incident.location}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </motion.section>
            {/* Crime Statistics Section */}
            <motion.section
              initial="hidden"
              animate="visible"
              custom={4}
              variants={containerVariants}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <div className="flex items-center gap-3 mb-6">
                <FiBarChart2 className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Crime Statistics
                </h2>
              </div>

              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setTimeRange("7days")}
                  className={`px-4 py-2 rounded-lg ${
                    timeRange === "7days"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => setTimeRange("30days")}
                  className={`px-4 py-2 rounded-lg ${
                    timeRange === "30days"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => setTimeRange("year")}
                  className={`px-4 py-2 rounded-lg ${
                    timeRange === "year"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  Last Year
                </button>
              </div>

              {liveData &&
                liveData.timeStats &&
                liveData.timeStats[timeRange] && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Incidents */}
                    <div className="bg-blue-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Total Incidents
                      </h3>
                      <p className="text-3xl font-bold text-blue-600">
                        {liveData.timeStats[timeRange].total}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Past{" "}
                        {timeRange === "7days"
                          ? "7"
                          : timeRange === "30days"
                          ? "30"
                          : "365"}{" "}
                        days
                      </p>
                    </div>

                    {/* Most Common */}
                    <div className="bg-green-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Most Common
                      </h3>
                      <p className="text-3xl font-bold text-green-600">
                        {liveData.timeStats[timeRange].mostCommon}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Top incident category
                      </p>
                    </div>

                    {/* Incidents by Category */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 col-span-1 md:col-span-3">
                      <div className="flex items-center gap-3 mb-4">
                        <FiPieChart className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-700">
                          Incidents by Category
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {liveData.timeStats[timeRange].categories.map(
                          (category, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between"
                            >
                              <span className="text-gray-700">
                                {category.name}
                              </span>
                              <div className="flex items-center gap-4">
                                <div className="w-32 bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${category.percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-gray-700 font-medium">
                                  {category.percentage}%
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Top Incident Types */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 col-span-1 md:col-span-3">
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        Top Incident Types
                      </h3>
                      <div className="flex flex-wrap gap-4">
                        {liveData.timeStats[timeRange].topTypes.map(
                          (type, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <span className="text-gray-700">
                                {type.name.charAt(0).toUpperCase() +
                                  type.name.slice(1)}
                              </span>
                              <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full"
                                  style={{
                                    width: `${
                                      (type.count /
                                        liveData.timeStats[timeRange]
                                          .topTypes[0].count) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-gray-700 font-medium">
                                {type.count}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </motion.section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
