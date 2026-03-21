import React, { createContext, useState, useEffect } from "react";
import { getLoggedInUser } from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserFromToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await getLoggedInUser();
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    loadUserFromToken();
  }, []);

  const login = (loginData) => {
    localStorage.setItem("token", loginData.token);
    const loadUser = async () => {
      try {
        const res = await getLoggedInUser();
        setUser(res.data);
      } catch (err) { console.error(err); }
    };
    loadUser();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};