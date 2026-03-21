import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { ChatContext } from "../context/ChatContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(ChatContext);

  if (!user) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;
