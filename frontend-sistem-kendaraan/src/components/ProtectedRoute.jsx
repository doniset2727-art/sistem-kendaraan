import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Cek apakah ada token di brankas browser
  const token = localStorage.getItem('token');

  // Jika tidak ada token, tendang kembali ke halaman Login ('/')
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Jika ada token, silakan masuk ke komponen yang dituju
  return children;
};

export default ProtectedRoute;