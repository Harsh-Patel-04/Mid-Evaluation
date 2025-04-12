import { motion } from "framer-motion";
import { FiAlertCircle } from "react-icons/fi";
import { Link } from "react-router-dom";

const CaseCard = ({ caseItem }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 p-3 rounded-lg">
          <FiAlertCircle className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {caseItem.title}
          </h3>
          <span
            className={`px-2 py-1 rounded-full text-sm ${
              caseItem.status === "Resolved"
                ? "bg-green-100 text-green-700"
                : caseItem.status === "Approved"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {caseItem.status}
          </span>

          <Link
            to={`/case/${caseItem.id}`}  
            className="mt-4 inline-block text-blue-600 hover:text-blue-700 text-sm"
          >
            View Details →
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default CaseCard;