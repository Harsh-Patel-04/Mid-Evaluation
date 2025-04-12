import { useEffect, useState } from "react";
import AuthNavbar from "../../components/AuthNavbar";
import Footer from "../../components/Footer";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { 
  FiInfo,
  FiAlertTriangle,
  FiCheckSquare,
  FiClock,
  FiX,
  FiMapPin,
  FiCalendar,
  FiUser,
  FiMessageSquare
} from "react-icons/fi";
import { motion } from "framer-motion";

const PendingCases = () => {
  const [pendingCases, setPendingCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPendingCases = async () => {
      try {
        const { data: casesData, error: casesError } = await supabase
          .from('reports')
          .select(`*,
            report_media (
              id, 
              file_url, 
              file_type,
              analysis_result,
              is_detected,
              flagged_categories
            )`)
          .order('reported_at', { ascending: false });

        if (casesError) throw casesError;

        const casesWithMedia = await Promise.all(
          casesData.map(async (report) => {
            const { data: mediaData, error: mediaError } = await supabase
              .from('report_media')
              .select('id, file_url, file_type, analysis_result')
              .eq('report_id', report.id);

            if (mediaError) throw mediaError;

            return {
              ...report,
              report_media: mediaData || [],
              media_analysis: mediaData[0]?.analysis_result || null
            };
          })
        );

        setPendingCases(casesWithMedia);
      } catch (err) {
        setError(err.message || "Failed to fetch pending cases");
        console.error("Error fetching pending cases:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingCases();
  }, []);

  const AnalysisCategories = ({ mediaAnalysis }) => {
    if (!mediaAnalysis) return null;

    const getAvailableCategories = () => {
      const categories = [];
      const excludedKeys = ['status', 'request']; 
      
      Object.keys(mediaAnalysis).forEach(key => {
        if (!excludedKeys.includes(key) && 
            (typeof mediaAnalysis[key] === 'object' || typeof mediaAnalysis[key] === 'number')) {
          categories.push(key);
        }
      });
      
      return categories;
    };

    const formatScore = (category) => {
      const value = mediaAnalysis[category];
      
      if (typeof value === 'number') {
        return `${(value * 100).toFixed(1)}%`;
      }
      
      if (typeof value === 'object') {
        if (category === 'nudity') {
          return `${((1 - value.safe) * 100).toFixed(1)}%`;
        }
        return value.prob ? `${(value.prob * 100).toFixed(1)}%` : 'N/A';
      }
      
      return 'N/A';
    };

    const categories = getAvailableCategories();

    return (
      <div className="mt-4 border-t pt-4">
        <h3 className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
          <FiInfo className="text-blue-500" />
          Content Analysis Results
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map(category => (
            <div 
              key={category} 
              className="bg-gray-50 p-3 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-medium text-gray-600 capitalize">
                  {category.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-800">
                  {formatScore(category)}
                </span>
              </div>
              
              {typeof mediaAnalysis[category] === 'object' && 
               !['prob', 'safe', 'raw', 'partial'].includes(category) && (
                <div className="mt-2 space-y-1">
                  {Object.entries(mediaAnalysis[category])
                    .filter(([subKey]) => !['prob', 'safe', 'raw', 'partial'].includes(subKey))
                    .map(([subKey, subValue]) => (
                      <div key={subKey} className="flex justify-between text-xs">
                        <span className="text-gray-500 capitalize">
                          {subKey.replace(/_/g, ' ')}
                        </span>
                        <span className="font-medium">
                          {typeof subValue === 'number' ? `${(subValue * 100).toFixed(1)}%` : 'N/A'}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {mediaAnalysis.is_detected && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
            <FiAlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">
              This content was flagged for: {mediaAnalysis.flagged_categories?.join(', ') || 'potential policy violations'}
            </p>
          </div>
        )}
      </div>
    );
  };

  const handleUpdateSeverity = async (caseId, newSeverity) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          severity: newSeverity,
          updated_at: new Date().toISOString()
        })
        .eq('id', caseId);

      if (error) throw error;

      setPendingCases(prev => prev.map(c => 
        c.id === caseId ? { ...c, severity: newSeverity } : c
      ));
      
      if (selectedCase && selectedCase.id === caseId) {
        setSelectedCase({...selectedCase, severity: newSeverity});
      }
    } catch (err) {
      console.error("Error updating severity:", err);
      setError("Failed to update severity");
    }
  };

  const handleMarkAsFake = async (caseId) => {
    if (!window.confirm("Are you sure you want to mark this case as fake? This will permanently delete it.")) {
      return;
    }

    try {
      const { data: mediaData, error: mediaError } = await supabase
        .from('report_media')
        .select('file_url')
        .eq('report_id', caseId);

      if (mediaError) throw mediaError;

      if (mediaData && mediaData.length > 0) {
        const filePaths = mediaData.map(m => m.file_path).filter(Boolean);
        if (filePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('incident-evidence')
            .remove(filePaths);

          if (storageError) throw storageError;
        }
      }

      const { error: deleteMediaError } = await supabase
        .from('report_media')
        .delete()
        .eq('report_id', caseId);

      if (deleteMediaError) throw deleteMediaError;

      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', caseId);

      if (error) throw error;

      setPendingCases(prev => prev.filter(c => c.id !== caseId));
      setSelectedCase(null);
    } catch (err) {
      console.error("Error deleting fake case:", err);
      setError("Failed to delete case");
    }
  };

  const handleApproveCase = async (caseId) => {
    console.log("Approving case ID:", caseId);

    try {
      setActionLoading(true);
      
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'under investigation',
          updated_at: new Date().toISOString()
        })
        .eq('id', caseId);

      if (error) throw error;

      setPendingCases(prev => prev.filter(c => c.id !== caseId));
      setSelectedCase(null);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const getCaseTimeline = (caseItem) => {
    return [
      {
        time: new Date(caseItem.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: "Report Submitted",
        description: "The incident was first reported by a user."
      },
      {
        time: new Date(new Date(caseItem.reported_at).getTime() + 30 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: "Initial Review",
        description: "The report was received and queued for review."
      },
      {
        time: "Now",
        title: "Pending Approval",
        description: "Awaiting moderator approval to proceed with investigation."
      }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-blue-50">
        <AuthNavbar />
        <main className="flex-grow p-8 max-w-7xl mx-auto w-full">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">
            Total Cases
          </h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-blue-50">
        <AuthNavbar />
        <main className="flex-grow p-8 max-w-7xl mx-auto w-full">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">
            Total Cases
          </h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-blue-50">
      <AuthNavbar />
      <main className="flex-grow p-8 max-w-7xl mx-auto w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Total Cases
        </h1>
        {pendingCases.length === 0 ? (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
            No pending cases found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingCases.map((caseItem) => (
              <motion.div 
                key={caseItem.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedCase(caseItem)}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {caseItem.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      caseItem.severity === 'high' ? 'bg-red-100 text-red-800' :
                      caseItem.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {caseItem.severity}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {caseItem.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{new Date(caseItem.reported_at).toLocaleDateString()}</span>
                    <span>{caseItem.report_media?.length || 0} media</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />

      {selectedCase && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedCase(null)}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedCase.title}</h2>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedCase.severity === 'high' 
                        ? 'bg-red-100 text-red-600' 
                        : selectedCase.severity === 'medium' 
                          ? 'bg-yellow-100 text-yellow-600' 
                          : 'bg-green-100 text-green-600'
                    }`}>
                      {selectedCase.severity} Severity
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                      Resolve Review
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCase(null)}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <FiAlertTriangle className="text-yellow-500" />
                      Incident Details
                    </h3>
                    <p className="text-gray-700 whitespace-pre-line">
                      {selectedCase.description}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FiMapPin className="w-5 h-5 text-blue-500" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Location</h3>
                        <p className="text-gray-700 font-medium">{selectedCase.location || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FiCalendar className="w-5 h-5 text-blue-500" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Date Reported</h3>
                        <p className="text-gray-700 font-medium">
                          {new Date(selectedCase.reported_at).toLocaleDateString('en-US', {
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
                      <FiUser className="w-5 h-5 text-blue-500" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Reporter</h3>
                        <p className="text-gray-700 font-medium">
                          {selectedCase.profiles?.full_name || 'Anonymous'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <FiMessageSquare className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Additional Notes</h3>
                        <p className="text-gray-700 font-medium">
                          {selectedCase.notes || 'No additional notes provided'}
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
                    {getCaseTimeline(selectedCase).map((update, index) => (
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

             
              {selectedCase.report_media.map((media) => {
  if (!media.file_url) {
    console.warn("Missing file URL for media:", media);
    return null;
  }

  return (
    <div key={media.id} className="relative mb-4 group">
      <button
        onClick={() => {
          const img = document.getElementById(`case-img-${media.id}`);
          if (img.requestFullscreen) {
            img.requestFullscreen();
          } else if (img.webkitRequestFullscreen) {
            img.webkitRequestFullscreen(); 
          } else if (img.msRequestFullscreen) {
            img.msRequestFullscreen(); 
          }
        }}
        className="absolute top-2 right-2 z-10 px-2 py-1 text-sm bg-black bg-opacity-60 text-white rounded hover:bg-opacity-80 transition hidden group-hover:block"
      >
        Fullscreen
      </button>

      <img
        id={`case-img-${media.id}`}
        src={media.file_url}
        alt="Case media"
        className="w-full max-h-[500px] object-contain rounded-lg shadow-md"
        onError={(e) => {
          console.error("Image failed to load:", media.file_url);
          e.target.style.display = "none";
        }}
      />
    </div>
  );
})}
              {selectedCase.media_analysis && (
                    <div className="mt-6">
                      <AnalysisCategories mediaAnalysis={selectedCase.media_analysis} />
                    </div>
                  )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default PendingCases;
