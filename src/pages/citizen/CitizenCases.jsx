import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiAlertCircle,
  FiSearch,
  FiChevronRight,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";
import CitizenNavbar from "../../components/CitizenNavbar";
import Footer from "../../components/Footer";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import IncidentDetailsModal from "./CitizenCaseDetails";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 },
  }),
};

export default function CitizenCases() {
  const [selectedCase, setSelectedCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isLoggedIn } = useAuth();

  const fetchCases = async (pageNum = 1) => {
    try {
      setLoading(true);
      const itemsPerPage = 6;
      const from = (pageNum - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { count } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true });

      setTotalPages(Math.ceil(count / itemsPerPage));

      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("reported_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setCases(
        data.map((report) => ({
          id: report.id,
          title: report.title,
          status: report.status.toLowerCase(),
          location: report.address || "Unknown location",
          date: new Date(report.reported_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          description: report.description,
          category: report.crime_type,
          severity: report.severity.toLowerCase(),
          // verified: report.status === "resolved",
          verified: report.verified,
        }))
      );

      setLoading(false);
    } catch (err) {
      console.error("Error fetching cases:", err);
      setError("Error fetching cases data");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCases(page);

      const reportsSubscription = supabase
        .channel("reports_changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "reports" },
          (payload) => {
            fetchCases(page);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(reportsSubscription);
      };
    }
  }, [isLoggedIn, page]);

  const filteredCases = cases.filter(
    (caseItem) =>
      caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-blue-50">
        <CitizenNavbar />
        <main className="flex-grow p-8 flex items-center justify-center">
          <p className="text-xl text-gray-700 bg-white p-8 rounded-xl shadow-lg">
            Please log in to access Cases
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-blue-50">
        <CitizenNavbar />
        <main className="flex-grow p-8 flex items-center justify-center">
          <p className="text-gray-600">Loading cases...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-blue-50">
        <CitizenNavbar />
        <main className="flex-grow p-8 flex items-center justify-center">
          <p className="text-red-600">{error}</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-blue-50">
      <CitizenNavbar />
      <main className="flex-grow p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-6xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Case Reports
            </h1>
            <p className="text-gray-600">Recent community-reported incidents</p>
          </div>

          <div className="mb-8 relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search cases..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredCases.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No cases found matching your search
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCases.map((c, i) => (
                  <motion.div
                    key={c.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() =>
                      setSelectedCase({
                        id: c.id,
                        type: c.title,
                        severity: c.severity,
                        verified: c.verified,
                        category: c.category,
                        date: c.date,
                        location: c.location,
                        description: c.description,
                        status: c.status,
                      })
                    }
                  >
                    <div className="block p-6 group">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-lg ${
                            c.severity === "high"
                              ? "bg-red-100"
                              : c.severity === "medium"
                              ? "bg-yellow-100"
                              : "bg-green-100"
                          }`}
                        >
                          <FiAlertCircle
                            className={`w-6 h-6 ${
                              c.severity === "high"
                                ? "text-red-600"
                                : c.severity === "medium"
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {c.title}
                          </h3>
                          <div className="flex items-center gap-2 mb-3">
                            <span
                              className={`px-2 py-1 rounded-full text-sm ${
                                c.status === "resolved"
                                  ? "bg-green-100 text-green-700"
                                  : c.status === "under investigation"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {c.status.charAt(0).toUpperCase() +
                                c.status.slice(1)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p className="flex items-center gap-1">
                              <FiMapPin className="w-4 h-4" />
                              {c.location}
                            </p>
                            <p className="flex items-center gap-1">
                              <FiCalendar className="w-4 h-4" />
                              {c.date}
                            </p>
                          </div>
                        </div>
                        <FiChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 flex justify-center items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-4 py-2 rounded-lg ${
                        pageNum === page
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}
              </div>
            </>
          )}

          {selectedCase && (
            <IncidentDetailsModal
              incident={selectedCase}
              onClose={() => setSelectedCase(null)}
            />
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
