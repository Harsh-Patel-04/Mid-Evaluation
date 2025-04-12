import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMap,
  FiAlertCircle,
  FiCheckCircle,
  FiActivity,
  FiMapPin,
  FiBell,
  FiClock,
  FiBarChart2,
} from "react-icons/fi";
import AuthNavbar from "../../components/AuthNavbar";
import IncidentMap from "../../components/IncidentMap";
import Footer from "../../components/Footer";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import AuthCrimeCharts from "./AuthCrimeCharts";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, type: "spring", stiffness: 80 },
  }),
};

export default function AuthDashboard() {
  const { isLoggedIn, user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState({
    totalCases: 0,
    resolved: 0,
    pending: 0,
    approved: 0,
    recentCases: [],
    topCrimes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((prev) =>
        prev.filter((note) => Date.now() - note.id < 15000)
      );
    }, 50000000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchData = async () => {
      try {
        // Fetch all reports count
        const { count: totalCases } = await supabase
          .from("reports")
          .select("*", { count: "exact" });

        // Fetch resolved reports count
        const { count: resolved } = await supabase
          .from("reports")
          .select("*", { count: "exact" })
          .eq("status", "resolved");

        // Fetch pending reports count
        const { count: pending } = await supabase
          .from("reports")
          .select("*", { count: "exact" })
          .eq("status", "pending");

        // Fetch approved reports count (assuming 'under investigation' is approved)
        const { count: approved } = await supabase
          .from("reports")
          .select("*", { count: "exact" })
          .eq("status", "under investigation");

        // Fetch recent cases (last 5)
        const { data: recentCases } = await supabase
          .from("reports")
          .select("*")
          .order("reported_at", { ascending: false })
          .limit(5);

        // Fetch crime statistics
        const { data: crimeStats } = await supabase
          .from("crime_statistics")
          .select("crime_type, total_reports")
          .order("total_reports", { ascending: false })
          .limit(3);

        // Fetch notifications
        const { data: userNotifications } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        setDashboardData({
          totalCases: totalCases || 0,
          resolved: resolved || 0,
          pending: pending || 0,
          approved: approved || 0,
          recentCases: recentCases || [],
          topCrimes: crimeStats || [],
        });

        setNotifications(userNotifications?.map((n) => n.message) || []);
        setLoading(false);
      } catch (err) {
        setError("Error fetching live data");
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
    const reportsAlertsSubscription = supabase
      .channel("reports_alerts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reports",
        },
        (payload) => {
          const newReport = payload.new;
          const alertMessage = `New case reported: ${
            newReport.report_id
          } - ${new Date(newReport.reported_at).toLocaleString()}`;
          setNotifications((prev) => [alertMessage, ...prev.slice(0, 4)]);
        }
      )
      .subscribe();

    // Set up realtime subscription
    const reportsSubscription = supabase
      .channel("reports_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reports",
        },
        (payload) => {
          fetchData(); // Refresh data when reports change
        }
      )
      .subscribe();

    const notificationsSubscription = supabase
      .channel("notifications_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [
            payload.new.message,
            ...prev.slice(0, 4),
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reportsSubscription);
      supabase.removeChannel(notificationsSubscription);
      supabase.removeChannel(reportsAlertsSubscription);
    };
  }, [isLoggedIn, user?.id]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <AuthNavbar />
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <AuthNavbar />
      <main className="flex-grow p-8 space-y-10 max-w-7xl mx-auto w-full">
        <motion.header
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold text-gray-800">Safety Dashboard</h1>
          <p className="text-gray-600 text-lg">
            Real-time community safety overview
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
          <div className="space-y-10">
            <motion.section
              initial="hidden"
              animate="visible"
              custom={1}
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              <Link to="/total">
                <motion.div
                  className="bg-gradient-to-br from-blue-600 to-blue-500 p-6 rounded-2xl text-white shadow-lg cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">
                        Total Cases
                      </h2>
                      <p className="text-3xl font-bold">
                        {dashboardData.totalCases}
                      </p>
                    </div>
                    <FiAlertCircle className="w-12 h-12 opacity-80" />
                  </div>
                  <div className="mt-4 h-1 bg-blue-400 rounded-full">
                    <div
                      className="h-full bg-white rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (dashboardData.totalCases / 200) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </motion.div>
              </Link>

              <Link to="/resolved">
                <motion.div
                  className="bg-gradient-to-br from-green-600 to-green-500 p-6 rounded-2xl text-white shadow-lg cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Resolved</h2>
                      <p className="text-3xl font-bold">
                        {dashboardData.resolved}
                      </p>
                    </div>
                    <FiCheckCircle className="w-12 h-12 opacity-80" />
                  </div>
                  <div className="mt-4 h-1 bg-green-400 rounded-full">
                    <div
                      className="h-full bg-white rounded-full"
                      style={{
                        width: `${
                          dashboardData.totalCases > 0
                            ? (dashboardData.resolved /
                                dashboardData.totalCases) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </motion.div>
              </Link>

              <Link to="/approved">
                <motion.div
                  className="bg-gradient-to-br from-yellow-600 to-yellow-500 p-6 rounded-2xl text-white shadow-lg cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Approved</h2>
                      <p className="text-3xl font-bold">
                        {dashboardData.approved}
                      </p>
                    </div>
                    <FiCheckCircle className="w-12 h-12 opacity-80" />
                  </div>
                  <div className="mt-4 h-1 bg-yellow-400 rounded-full">
                    <div
                      className="h-full bg-white rounded-full"
                      style={{
                        width: `${
                          dashboardData.totalCases > 0
                            ? (dashboardData.approved /
                                dashboardData.totalCases) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </motion.div>
              </Link>

              <Link to="/pending">
                <motion.div
                  className="bg-gradient-to-br from-red-600 to-red-500 p-6 rounded-2xl text-white shadow-lg cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Pending</h2>
                      <p className="text-3xl font-bold">
                        {dashboardData.pending}
                      </p>
                    </div>
                    <FiClock className="w-12 h-12 opacity-80" />
                  </div>
                  <div className="mt-4 h-1 bg-red-400 rounded-full">
                    <div
                      className="h-full bg-white rounded-full"
                      style={{
                        width: `${
                          dashboardData.totalCases > 0
                            ? (dashboardData.pending /
                                dashboardData.totalCases) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </motion.div>
              </Link>
            </motion.section>

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
            {/* Live Feed Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Notifications Panel */}
              <motion.section
                initial="hidden"
                animate="visible"
                custom={2}
                variants={containerVariants}
                className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <FiBell className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Live Alerts
                  </h2>
                </div>
                <div className="space-y-6 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {notifications.map((note, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-600"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                          <p className="text-gray-700">{note}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.section>

              {/* Recent Activity */}
              <motion.section
                initial="hidden"
                animate="visible"
                custom={3}
                variants={containerVariants}
                className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <FiActivity className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Recent Activity
                  </h2>
                </div>
                <div className="space-y-4">
                  <AnimatePresence>
                    {dashboardData.recentCases.map((c) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="group flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FiMapPin className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {c.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-600">
                                {new Date(c.reported_at).toLocaleString()}
                              </span>
                              <span
                                className={`text-sm px-2 py-1 rounded-full ${
                                  c.status === "resolved"
                                    ? "bg-green-100 text-green-700"
                                    : c.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-blue-100 text-blue-600"
                                }`}
                              >
                                {c.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.section>
            </div>
            <AuthCrimeCharts />
           
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
