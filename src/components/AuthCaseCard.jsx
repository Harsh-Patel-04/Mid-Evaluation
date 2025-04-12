import { motion } from "framer-motion";
import { FiAlertCircle, FiImage, FiVideo, FiEdit, FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthCaseCard = ({ caseItem, onUpdate }) => {
  const [media, setMedia] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    status: caseItem.status,
    severity: caseItem.severity
  });

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoadingMedia(true);
        const { data: mediaRefs, error: refError } = await supabase
          .from('report_media')
          .select('file_url, file_type')
          .eq('report_id', caseItem.id);

        if (refError) throw refError;

        const processedMedia = mediaRefs.map(item => ({
          url: item.file_url,
          type: item.file_type,
          previewUrl: item.file_url.replace('/storage/v1/object/public/', '/storage/v1/object/public/thumbnail/')
        }));

        setMedia(processedMedia);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingMedia(false);
      }
    };

    if (caseItem?.id) {
      fetchMedia();
    }
  }, [caseItem?.id]);

  const handleStatusChange = (e) => {
    setEditedData({ ...editedData, status: e.target.value });
  };

  const handleSeverityChange = (e) => {
    setEditedData({ ...editedData, severity: e.target.value });
  };

  const saveChanges = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .update({
          status: editedData.status,
          severity: editedData.severity,
          updated_at: new Date().toISOString()
        })
        .eq('id', caseItem.id)
        .select();

      if (error) throw error;
      
      setIsEditing(false);
      if (onUpdate) onUpdate(data[0]);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!caseItem) return null;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-blue-100"
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${
          caseItem.severity === "high" ? "bg-red-100" :
          caseItem.severity === "medium" ? "bg-yellow-100" : "bg-green-100"
        }`}>
          <FiAlertCircle className={`w-6 h-6 ${
            caseItem.severity === "high" ? "text-red-600" :
            caseItem.severity === "medium" ? "text-yellow-600" : "text-green-600"
          }`} />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {caseItem.title}
            </h3>
            
            {isEditing ? (
              <button 
                onClick={saveChanges}
                className="text-green-600 hover:text-green-800 p-1"
              >
                <FiCheck className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-800 p-1"
              >
                <FiEdit className="w-5 h-5" />
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editedData.status}
                  onChange={handleStatusChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="pending">pending</option>
                  <option value="approved">under investigation</option>
                  <option value="rejected">resolved</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  value={editedData.severity}
                  onChange={handleSeverityChange}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 mb-3">
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  caseItem.status === "resolved"
                    ? "bg-green-100 text-green-700"
                    : caseItem.status === "approved"
                    ? "bg-yellow-100 text-yellow-700"
                    : caseItem.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {caseItem.status.replace('_', ' ')}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  caseItem.severity === "high"
                    ? "bg-red-100 text-red-700"
                    : caseItem.severity === "medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : caseItem.severity === "critical"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {caseItem.severity} severity
              </span>
            </div>
          )}

          {loadingMedia ? (
            <div className="mt-3 h-16 bg-gray-100 rounded-lg animate-pulse"></div>
          ) : error ? (
            <p className="mt-2 text-sm text-red-500">Error loading media</p>
          ) : media.length > 0 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {media.map((item, index) => (
                <div key={index} className="flex-shrink-0 relative">
                  {item.type === 'image' ? (
                    <img 
                      src={item.previewUrl} 
                      alt={`Case ${caseItem.id} media`}
                      className="h-16 w-16 object-cover rounded-md border border-gray-200"
                      onError={(e) => {
                        e.target.src = item.url;
                      }}
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
                      <FiVideo className="text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 h-16 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
              <FiImage className="mr-2" />
              <span className="text-sm">No media</span>
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <Link
              to={`/admin/case/${caseItem.id}`}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              View Details →
            </Link>
            
            <span className="text-xs text-gray-500">
              {new Date(caseItem.reported_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AuthCaseCard;