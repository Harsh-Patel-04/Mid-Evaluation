import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiHome,
  FiAlertCircle,
  FiPlusSquare,
  FiLogIn,
  FiUserPlus,
  FiLogOut,
  FiMenu,
  FiX,
  FiMap,
  FiAlertTriangle,
  FiSmartphone,
  FiArrowRight,
  FiUser,
} from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";
const NavLink = ({ to, children, icon: Icon, onClick }) => (
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg"
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span>{children}</span>
    </Link>
  </motion.div>
);

export default function Navbar() {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const AuthButtons = () => (
    <div className="flex flex-col md:flex-row gap-2">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link
          to="/login"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all"
        >
          <FiLogIn className="w-5 h-5" />
          Login
        </Link>
      </motion.div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Link
          to="/signup"
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all"
        >
          <FiUserPlus className="w-5 h-5" />
          Signup
        </Link>
      </motion.div>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center"
          >
            <Link to="/" className="text-2xl font-bold text-blue-600">
              CrimeRadar
            </Link>
          </motion.div>
         
          <nav className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <NavLink to="/" icon={FiHome}>
                  Home
                </NavLink>
                <NavLink to="/citizen-cases" icon={FiAlertCircle}>
                  Cases
                </NavLink>
                <NavLink to="/citizen-register-case" icon={FiPlusSquare}>
                  Report Case
                </NavLink>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    logout();
                    navigate("/"); 
                  }}
                  className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors ml-4"
                >
                  <FiLogOut className="w-5 h-5" />
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                {!["/login", "/signup"].includes(location.pathname) && (
                  <AuthButtons />
                )}
                {location.pathname === "/login" && (
                  <Link
                    to="/signup"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all"
                  >
                    <FiUserPlus className="w-5 h-5" />
                    Signup
                  </Link>
                )}
                {location.pathname === "/signup" && (
                  <Link
                    to="/login"
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all"
                  >
                    <FiLogIn className="w-5 h-5" />
                    Login
                  </Link>
                )}
              </>
            )}
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute w-full bg-white shadow-lg py-4"
          >
            <div className="px-4 space-y-2">
              {isLoggedIn ? (
                <>
                  <NavLink
                    to="/"
                    icon={FiHome}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/cases"
                    icon={FiAlertCircle}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cases
                  </NavLink>
                  <NavLink
                    to="/register-case"
                    icon={FiPlusSquare}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Report Case
                  </NavLink>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                      navigate("/"); 
                    }}
                    className="w-full flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mt-4"
                  >
                    <FiLogOut className="w-5 h-5" />
                    Logout
                  </motion.button>
                </>
              ) : (
                <div className="space-y-2">
                  <NavLink
                    to="/login"
                    icon={FiLogIn}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/signup"
                    icon={FiUserPlus}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Signup
                  </NavLink>
                </div>
              )}
            </div>
          </motion.nav>
        )}
      </div>
    </header>
  );
}
