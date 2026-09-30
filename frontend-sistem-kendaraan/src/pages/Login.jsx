import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); 

    try {
      const response = await axios.post('http://localhost:5000/api/v1/users/login', {
        nip: nip,
        password: password
      });

      // 1. Ambil token dan sekumpulan data profil user dari balasan backend
      const userData = response.data.data;
      const token = userData.token;

      // 2. Simpan Token untuk akses API
      localStorage.setItem('token', token);
      
      // 3. Simpan Profil User (tanpa token) agar halaman lain mengenali siapa yang sedang aktif
      const profile = { 
        id: userData.id, 
        name: userData.name, 
        nip: userData.nip, 
        role: userData.role,
        department_id: userData.department_id // Berguna untuk filter departemen nanti
      };
      // Ubah jadi string sebelum masuk ke localStorage
      localStorage.setItem('user', JSON.stringify(profile));
      
      alert(`Login Berhasil sebagai ${userData.role.toUpperCase()}! 🎉`);
      
      // 4. POLISI LALU LINTAS (Mengarahkan sesuai jabatan)
      if (userData.role === 'admin') {
        // Jika Admin Kendaraan -> Masuk ke Pusat Kendali
        navigate('/dashboard');
      } else if (userData.role === 'manager') {
        // Jika Manager -> Masuk ke Daftar Persetujuan (Approval)
        navigate('/approvals');
      } else {
        // Jika Staff Biasa -> Masuk ke halaman Form Tiket Saya
        navigate('/my-bookings');
      }

    } catch (error) {
      alert('Login Gagal: ' + (error.response?.data?.message || 'Terjadi kesalahan server'));
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <div style={{ padding: '30px', border: '1px solid #ccc', borderRadius: '10px', width: '300px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login Kendaraan</h2>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label>NIP:</label><br />
            <input 
              type="text" 
              value={nip} 
              onChange={(e) => setNip(e.target.value)} 
              required 
              placeholder="Masukkan NIP Anda"
              style={{ width: '90%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label>Password:</label><br />
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Masukkan Password"
              style={{ width: '90%', padding: '8px', marginTop: '5px' }}
            />
          </div>
          
          <button type="submit" style={{ width: '100%', padding: '10px', background: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            MASUK
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;