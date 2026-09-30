import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Reports from './pages/Reports';
import FormBooking from './pages/FormBooking';
import Approvals from './pages/Approvals';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Rute Admin Kendaraan */}
        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/vehicles" element={<ProtectedRoute><MainLayout><Vehicles /></MainLayout></ProtectedRoute>} />
        <Route path="/drivers" element={<ProtectedRoute><MainLayout><Drivers /></MainLayout></ProtectedRoute>} />
        <Route path="/trips" element={<ProtectedRoute><MainLayout><Trips /></MainLayout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><MainLayout><Reports /></MainLayout></ProtectedRoute>} />
        <Route path="/my-bookings" element={<FormBooking />} />
        <Route path="/approvals" element={<Approvals />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;