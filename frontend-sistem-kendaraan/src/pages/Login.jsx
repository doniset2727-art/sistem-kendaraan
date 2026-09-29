import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  // Tempat menyimpan ketikan user
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Fungsi yang dijalankan saat tombol "Masuk" ditekan
  const handleLogin = async (e) => {
    e.preventDefault(); // Mencegah halaman refresh otomatis

    try {
      // 1. Tembak API Backend Node.js
      const response = await axios.post('http://localhost:5000/api/v1/users/login', {
        email: email,
        password: password
      });

      // 2. Ambil token dari balasan backend
      const token = response.data.data.token;

      // 3. Simpan token ke dalam "Brankas" Browser (Local Storage)
      localStorage.setItem('token', token);
      
      alert('Login Berhasil! 🎉');
      
      // 4. Pindah ke halaman Dashboard
      navigate('/dashboard');

    } catch (error) {
      // Jika salah password / email tidak ada
      alert('Login Gagal: ' + (error.response?.data?.message || 'Terjadi kesalahan server'));
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <div style={{ padding: '30px', border: '1px solid #ccc', borderRadius: '10px', width: '300px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login Kendaraan</h2>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label>Email:</label><br />
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
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