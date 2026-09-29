import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Card, Button, Modal, Form, Badge } from 'react-bootstrap';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // State untuk form input mobil baru disesuaikan dengan backend
  const [formData, setFormData] = useState({
    brand_model: '',
    type: '',
    license_plate: '',
  });
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/vehicles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVehicles(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data kendaraan", error);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/v1/vehicles', formData, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      // Tutup modal, bersihkan form, dan refresh data
      setShowModal(false);
      setFormData({ brand_model: '', type: '', license_plate: '' });
      fetchVehicles(); 
    } catch (error) {
      alert('Gagal menambah kendaraan: ' + (error.response?.data?.message || 'Error'));
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
        <h2>Garasi Master Kendaraan</h2>
        <Button variant="success" onClick={() => setShowModal(true)}>
          + Daftarkan Mobil Baru
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Table striped bordered hover responsive className="align-middle">
            <thead className="table-dark">
              <tr>
                <th width="5%">ID</th>
                <th>Nama / Tipe Mobil</th>
                <th>Plat Nomor</th>
                <th width="15%">Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length > 0 ? (
                vehicles.map(vehicle => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.id}</td>
                    <td className="fw-bold">{vehicle.brand_model}</td>
                    <td><Badge bg="secondary" className="fs-6">{vehicle.license_plate}</Badge></td>
                    <td>
                      {/* Asumsi default mobil baru adalah 'Tersedia' (Available) */}
                      <Badge bg="success">Tersedia</Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="text-center py-4 text-muted">Belum ada mobil di garasi.</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal Tambah Kendaraan */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Registrasi Mobil Baru</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddVehicle}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nama Kendaraan (Merek & Tipe)</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Contoh: Toyota Kijang Innova Zenix" 
                value={formData.brand_model} // Ubah di sini
                onChange={(e) => setFormData({...formData, brand_model: e.target.value})} // Ubah di sini
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nomor Polisi (Plat)</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Contoh: B 1234 KFD" 
                value={formData.license_plate}
                onChange={(e) => setFormData({...formData, license_plate: e.target.value.toUpperCase()})}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowModal(false)}>Batal</Button>
            <Button variant="success" type="submit">Simpan ke Garasi</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Vehicles;