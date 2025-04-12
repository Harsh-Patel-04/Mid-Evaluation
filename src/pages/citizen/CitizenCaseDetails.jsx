import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckSquare, FiClock, FiAlertTriangle, FiX, FiMapPin, FiCalendar } from 'react-icons/fi';
import { supabase } from '../../lib/supabase';

const IncidentDetailsModal = ({ incidentId, onClose }) => {
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('id', incidentId)
          .single();

        if (error) throw error;
        
        setIncident(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching incident:', err);
      } finally {
        setLoading(false);
      }
    };

    if (incidentId) {
      fetchIncident();
    }
  }, [incidentId]);

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
      title: incident?.status === "Resolved" ? "Case Closed" : "Ongoing Investigation",
      description: incident?.status === "Resolved" 
        ? "The case has been successfully resolved." 
        : "Investigation is still ongoing. Updates will follow."
    }
  ];

  if (loading) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-8 text-center">
        <p>Loading incident details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-8 text-center">
        <p className="text-red-500">Error: {error}</p>
        <button 
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );

  if (!incident) return null;

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
                  incident.severity === 'High' 
                    ? 'bg-red-100 text-red-600' 
                    : incident.severity === 'Medium' 
                      ? 'bg-yellow-100 text-yellow-600' 
                      : 'bg-green-100 text-green-600'
                }`}>
                  {incident.severity} Severity
                </span>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  incident.status === "Resolved"
                    ? "bg-green-100 text-green-600"
                    : incident.status === "Under Investigation"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-red-100 text-red-600"
                }`}>
                  {incident.status}
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
                    <p className="text-gray-700 font-medium">
                      {new Date(incident.reported_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full ${
                      incident.severity === 'High' ? 'bg-red-500' :
                      incident.severity === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Severity</h3>
                    <p className="text-gray-700 font-medium">{incident.severity}</p>
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

export default IncidentDetailsModal;