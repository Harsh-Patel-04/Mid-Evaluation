import React, { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import AuthNavbar from "../../components/AuthNavbar";
import Footer from "../../components/Footer";

const handleVerify = () => {
  setCaseData((prev) => ({ ...prev, status: "Approved" }));

  const updatedCases = cases.map((c) =>
    c.id === caseData.id ? { ...c, status: "Approved" } : c
  );
  localStorage.setItem("cases", JSON.stringify(updatedCases));

  navigate("/pending");
};

const VerifyCaseDetails = () => {
  const { caseId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cases, setCases] = useState(() => {
    const saved = localStorage.getItem("cases");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            title: "Burglary in Downtown",
            status: "Pending",
            type: "Burglary",
            date: "2023-08-15 15:45",
            location: "VR Mall, Basement Parking",
            description: "Fire broke out in the parking area...",
            evidence: [],
          },
        ];
  });

  const currentCase = cases.find((c) => c.id === parseInt(caseId));
  const [caseData, setCaseData] = useState(currentCase);

  const handleVerify = () => {
    const updatedCases = cases.map((c) =>
      c.id === caseData.id ? { ...c, status: "Approved" } : c
    );

    setCases(updatedCases);
    localStorage.setItem("cases", JSON.stringify(updatedCases));
    setCaseData((prev) => ({ ...prev, status: "Approved" }));
    navigate("/pending");
  };

  if (!caseData) return <div>Case not found</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-blue-50">
      <AuthNavbar />
      <main className="flex-grow p-8 max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {caseData.title}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Case Type</label>
                <p className="font-medium">{caseData.type}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Status</label>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    caseData.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : caseData.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {caseData.status}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Date Reported</label>
                <p className="font-medium">{caseData.date}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Location</label>
                <p className="font-medium">{caseData.location}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Case Description</h2>
            <p className="text-gray-700">{caseData.description}</p>
          </div>

          {user?.role === "authority" && caseData.status === "Pending" && (
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleVerify}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Verify and Approve Case
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyCaseDetails;
