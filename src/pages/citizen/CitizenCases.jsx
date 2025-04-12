import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiAlertCircle,
  FiSearch,
  FiChevronRight,
  FiMapPin,
  FiCalendar,
  FiCheckSquare,
  FiClock,
  FiAlertTriangle,
  FiX
} from "react-icons/fi";
import CitizenNavbar from "../../components/CitizenNavbar";
import Footer from "../../components/Footer";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

const IncidentDetailsModal = ({ incident, onClose }) => {
  if (!incident) return null;

  const updates = [
    {
      time: "3:50 PM",
      title: "Emergency Services Dispatched",
      description: "First responders are on the way to the scene."
    },
    {
      time: "4:10 PM",
      title: "Situation Under Control",
      description: "Authorities have the situation under control. No casualties reported."
    },
    {
      time: "4:30 PM",
      title: "Investigation Started",
      description: "Officials are investigating the cause of the incident."
    },
    {
      time: "6:00 PM",
      title: incident.status === "resolved" ? "Case Closed" : "Ongoing Investigation",
      description: incident.status === "resolved" 
        ? "The case has been successfully resolved." 
        : "Investigation is still ongoing. Updates will follow."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{incident.type}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-sm ${
                  incident.severity === 'high' 
                    ? 'bg-red-100 text-red-600' 
                    : incident.severity === 'medium' 
                      ? 'bg-yellow-100 text-yellow-600' 
                      : 'bg-green-100 text-green-600'
                }`}>
                  {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)} Severity
                </span>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  incident.status === "resolved"
                    ? "bg-green-100 text-green-600"
                    : incident.status === "under investigation"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-red-100 text-red-600"
                }`}>
                  {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                </span>
                {incident.verified && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-600 text-sm">
                    <FiCheckSquare className="w-4 h-4" />
                    Verified
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <FiAlertTriangle className="text-yellow-500" />
                  Incident Details
                </h3>
                <p className="text-gray-700">
                  {incident.description}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FiMapPin className="w-5 h-5 text-blue-500" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="text-gray-700 font-medium">{incident.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FiCalendar className="w-5 h-5 text-blue-500" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date Reported</h3>
                    <p className="text-gray-700 font-medium">{incident.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full ${
                      incident.severity === 'high' ? 'bg-red-500' :
                      incident.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Severity</h3>
                    <p className="text-gray-700 font-medium">
                      {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FiCheckSquare className={`w-5 h-5 ${
                    incident.verified ? 'text-green-500' : 'text-gray-400'
                  }`} />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Verification Status</h3>
                    <p className="text-gray-700 font-medium">
                      {incident.verified ? 'Verified' : 'Unverified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiClock className="text-blue-500" />
                Case Timeline
              </h3>
              <div className="space-y-4">
                {updates.map((update, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-blue-600">{update.time}</span>
                      <span className="font-semibold">{update.title}</span>
                    </div>
                    <p className="text-gray-600 mt-1">{update.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 },
  }),
};

export default function Cases() {
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
        .from('reports')
        .select('*', { count: 'exact', head: true })

      setTotalPages(Math.ceil(count / itemsPerPage));

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('reported_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setCases(data.map(report => ({
        id: report.id,
        title: report.title,
        status: report.status.toLowerCase(),
        location: report.address || 'Unknown location',
        date: new Date(report.reported_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }), 
        description: report.description,
        category: report.crime_type,
        severity: report.severity.toLowerCase(),
        verified: report.status === 'resolved'
      })));

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
        .channel('reports_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, payload => {
          fetchCases(page);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(reportsSubscription);
      };
    }
  }, [isLoggedIn, page]);

  const filteredCases = cases.filter(caseItem =>
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
              <p className="text-gray-500 text-lg">No cases found matching your search</p>
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
                    onClick={() => setSelectedCase({
                      id: c.id,
                      type: c.title,
                      severity: c.severity,
                      verified: c.verified,
                      category: c.category,
                      date: c.date,
                      location: c.location,
                      description: c.description,
                      status: c.status
                    })}
                  >
                    <div className="block p-6 group">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          c.severity === "high" ? "bg-red-100" :
                          c.severity === "medium" ? "bg-yellow-100" : "bg-green-100"
                        }`}>
                          <FiAlertCircle className={`w-6 h-6 ${
                            c.severity === "high" ? "text-red-600" :
                            c.severity === "medium" ? "text-yellow-600" : "text-green-600"
                          }`} />
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
                              {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-4 py-2 rounded-lg ${
                      pageNum === page ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
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