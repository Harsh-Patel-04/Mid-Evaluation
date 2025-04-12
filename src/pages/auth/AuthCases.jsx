import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiAlertCircle,
  FiSearch,
  FiChevronRight,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";
import AuthNavbar from "../../components/AuthNavbar";
import Footer from "../../components/Footer";
import IncidentDetailsModal from "./AuthCaseDetails";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 },
  }),
};

// const caseList = [
//   {
//     id: 1,
//     title: "Burglary in Downtown",
//     status: "Under Investigation",
//     location: "Main Street",
//     date: "2023-08-15",
//     description:
//       "A burglary was reported at a downtown store. Police are investigating possible suspects using security footage. Estimated loss is $5,000.",
//     category: "Property Crime",
//     severity: "Medium",
//     verified: false,
//   },
//   {
//     id: 2,
//     title: "Vandalism at Central Park",
//     status: "Resolved",
//     location: "Central Park",
//     date: "2023-08-12",
//     description:
//       "Graffiti reported on park structures. Cleanup completed by city services. No suspects identified. Damage estimated at $1,200.",
//     category: "Public Nuisance",
//     severity: "Low",
//     verified: true,
//   },
//   {
//     id: 3,
//     title: "Car Theft on 5th Avenue",
//     status: "New Report",
//     location: "5th Avenue",
//     date: "2023-08-10",
//     description:
//       "Vehicle reported stolen from parking lot. Security footage being reviewed by authorities. 2019 Honda Accord, license plate XYZ123.",
//     category: "Vehicle Theft",
//     severity: "High",
//     verified: false,
//   },
//   {
//     id: 4,
//     title: "Assault Near City Hall",
//     status: "Under Investigation",
//     location: "City Hall Plaza",
//     date: "2023-08-08",
//     description:
//       "Physical altercation reported between two individuals. One victim transported to hospital with minor injuries.",
//     category: "Violent Crime",
//     severity: "High",
//     verified: true,
//   },
//   {
//     id: 5,
//     title: "Shoplifting at Mall",
//     status: "Resolved",
//     location: "Riverside Mall",
//     date: "2023-08-05",
//     description:
//       "Individual apprehended for stealing clothing items. Merchandise recovered. Suspect released with citation.",
//     category: "Theft",
//     severity: "Low",
//     verified: true,
//   },
//   {
//     id: 6,
//     title: "Suspicious Package",
//     status: "New Report",
//     location: "Central Station",
//     date: "2023-08-03",
//     description:
//       "Unattended bag reported at train station. Bomb squad called as precaution. Area evacuated temporarily.",
//     category: "Public Safety",
//     severity: "Medium",
//     verified: false,
//   },
// ];

export default function Cases() {
  const [selectedCase, setSelectedCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCases = caseList.filter(
    (caseItem) =>
      caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-blue-50">
      <AuthNavbar />
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
                            c.severity === "High"
                              ? "bg-red-100"
                              : c.severity === "Medium"
                              ? "bg-yellow-100"
                              : "bg-green-100"
                          }`}
                        >
                          <FiAlertCircle
                            className={`w-6 h-6 ${
                              c.severity === "High"
                                ? "text-red-600"
                                : c.severity === "Medium"
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
                                c.status === "Resolved"
                                  ? "bg-green-100 text-green-700"
                                  : c.status === "Under Investigation"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {c.status}
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
                <button className="px-4 py-2 rounded-lg bg-blue-600 text-white">
                  1
                </button>
                <button className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
                  2
                </button>
                <button className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
                  3
                </button>
                <span className="text-gray-400 mx-2">...</span>
                <button className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
                  Next
                </button>
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
