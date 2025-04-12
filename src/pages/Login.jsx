import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { FiUser, FiLock, FiShield, FiArrowRight } from "react-icons/fi";
import Navbar from "../components/CitizenNavbar";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const formVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export default function Login() {
  const { login } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("public");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const form = e.currentTarget;
    const email = form.email?.value;
    const password = form.password?.value;

    try {
      await login(email, password);
      const path = activeTab === "public" ? "/citizen-dashboard" : "/auth-dashboard";
      navigate(path);
    } catch (error) {
      console.error("Login failed:", error.message);
      setErrorMessage(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const PublicLoginForm = () => (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              name="email"
              type="email"
              placeholder="john.doe@example.com"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <p className="text-red-600 text-sm text-center">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3.5 rounded-lg font-medium hover:from-blue-700 hover:to-blue-600 transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <>
            <span>Continue as Citizen</span>
            <FiArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </motion.form>
  );

  const AuthorityLoginForm = () => (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      variants={formVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email or Username
          </label>
          <div className="relative">
            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              name="email"
              type="text"
              placeholder="authority@example.com"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Authority Code
          </label>
          <div className="relative">
            <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              name="authorityCode"
              type="text"
              placeholder="XXXX-XXXX-XXXX"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <p className="text-red-600 text-sm text-center">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3.5 rounded-lg font-medium hover:from-blue-700 hover:to-blue-600 transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <>
            <span>Authority Login</span>
            <FiArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </motion.form>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      <main className="flex-grow p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex">
          
          <div className="hidden md:block flex-1 bg-gradient-to-br from-blue-600 to-blue-500 p-8">
            <div className="h-full flex flex-col justify-center items-center text-white">
              <img
                src="/images/img10.webp"
                alt="Security Illustration"
                className="w-80 h-80 mb-8"
              />
              <h2 className="text-3xl font-bold mb-4">
                Community Safety First
              </h2>
              <p className="text-center text-blue-100">
                Together we build safer neighborhoods through collaboration and
                awareness.
              </p>
            </div>
          </div>

          <div className="flex-1 p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600 mb-8">
                Please login to continue to your account
              </p>

              <div className="flex gap-4 mb-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab("public")}
                  className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    activeTab === "public"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FiUser className="w-5 h-5" />
                  Citizen
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab("authority")}
                  className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    activeTab === "authority"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FiShield className="w-5 h-5" />
                  Authority
                </motion.button>
              </div>

              {activeTab === "public" ? <PublicLoginForm /> : <AuthorityLoginForm />}

              <div className="mt-6 text-center">
                <a
                  href="#forgot-password"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Forgot password?
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
