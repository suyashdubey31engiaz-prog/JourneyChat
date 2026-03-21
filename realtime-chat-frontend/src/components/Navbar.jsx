import React from "react";
import { FaUserCircle, FaMoon, FaSun } from "react-icons/fa";

const Navbar = ({ darkMode, toggleDarkMode }) => {
  return (
    <nav className="w-full flex justify-between items-center p-4 glass">
      <div className="flex items-center gap-2">
        <FaUserCircle size={30} className="text-primary" />
        <span className="font-poppins font-semibold text-lg text-light-text">
          ChatSphere
        </span>
      </div>
      <button
        onClick={toggleDarkMode}
        className="text-light-text text-xl hover:text-primary transition"
      >
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>
    </nav>
  );
};

export default Navbar;
