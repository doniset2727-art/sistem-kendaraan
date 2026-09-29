import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Navbar, Button } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const token = localStorage.getItem('token');
  let user = {};
  if (token) {
    try {
      user = jwtDecode(token);
    } catch (error) {
      console.error("Token tidak valid");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'bg-primary rounded' : '';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '260px', backgroundColor: '#343a40', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h5 className="mb-4 text-center fw-bold">🚗 Sistem Kendaraan Operasional</h5>
        
        <div className="mb-4 text-center p-2 rounded" style={{ backgroundColor: '#495057' }}>
          <small className="d-block text-muted">Login sebagai:</small>
          <strong>{user.role ? user.role.toUpperCase() : 'USER'}</strong>
        </div>
        <hr className="mt-0" />

        <ul className="nav flex-column mt-2">
          {/* MENU UMUM */}
          <li className={`nav-item mb-2 ${isActive('/dashboard')}`}>
            <Link to="/dashboard" className="nav-link text-white">🏠 Dashboard</Link>
          </li>

          {/* MENU KHUSUS ADMIN KENDARAAN */}
          {user.role === 'admin' && (
            <>
              <small className="text-muted mt-3 mb-2 fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                MASTER DATA
              </small>
              <li className={`nav-item mb-1 ${isActive('/vehicles')}`}>
                <Link to="/vehicles" className="nav-link text-white">🚙 Data Kendaraan</Link>
              </li>
              <li className={`nav-item mb-2 ${isActive('/drivers')}`}>
                <Link to="/drivers" className="nav-link text-white">👨‍✈️ Data Supir</Link>
              </li>

              <small className="text-muted mt-3 mb-2 fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                MONITORING & LAPORAN
              </small>
              <li className={`nav-item mb-1 ${isActive('/trips')}`}>
                <Link to="/trips" className="nav-link text-white">🛣️ Riwayat Perjalanan</Link>
              </li>
              <li className={`nav-item mb-2 ${isActive('/reports')}`}>
                <Link to="/reports" className="nav-link text-white">💰 Laporan Biaya</Link>
              </li>
            </>
          )}

          {/* MENU KHUSUS STAFF */}
          {user.role === 'staff' && (
            <li className={`nav-item mb-2 ${isActive('/bookings')}`}>
              <Link to="/bookings" className="nav-link text-white">📝 Pesan Kendaraan</Link>
            </li>
          )}
        </ul>
      </div>

      {/* KONTEN UTAMA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar bg="white" className="shadow-sm px-4 mb-4 d-flex justify-content-between" style={{ height: '65px' }}>
          <span className="fw-bold text-muted">Portal Operasional Admin</span>
          <Button variant="outline-danger" size="sm" onClick={handleLogout}>Logout</Button>
        </Navbar>
        <div style={{ padding: '0 30px', paddingBottom: '30px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;