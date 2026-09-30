import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Card, Table, Badge, Button, Modal, Form, Row, Col } from 'react-bootstrap';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // State form disesuaikan dengan Controller Backend
  const [formData, setFormData] = useState({
    brand_model: '',
    license_plate: '',
    type: 'MPV', // Nilai default dropdown
    current_odometer: ''
  });

  const token = localStorage.getItem('token');

  const fetchVehicles = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/vehicles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.data) setVehicles(response.data.data);
    } catch (error) {
      console.log("Menunggu backend API vehicles disiapkan.");
    }
  }, [token]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/v1/vehicles', formData, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      alert('Mobil berhasil ditambahkan ke garasi!');
      setShowModal(false);
      // Reset form setelah berhasil
      setFormData({ brand_model: '', license_plate: '', type: 'MPV', current_odometer: '' });
      fetchVehicles(); 
    } catch (error) {
      alert('Gagal menambah mobil: ' + (error.response?.data?.message || 'Terjadi kesalahan server'));
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
          <Table striped hover responsive className="align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Merek & Model</th>
                <th>Tipe / Kategori</th>
                <th>Plat Nomor</th>
                <th>KM Saat Ini</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length > 0 ? (
                vehicles.map(v => (
                  <tr key={v.id}>
                    <td>{v.id}</td>
                    <td className="fw-bold">{v.brand_model}</td>
                    <td>{v.type}</td>
                    <td>
                      <Badge bg="secondary" className="fs-6">{v.license_plate}</Badge>
                    </td>
                    <td>{Number(v.current_odometer || 0).toLocaleString('id-ID')} KM</td>
                    <td>
                      <Badge bg={v.status === 'available' ? 'success' : v.status === 'in_use' ? 'warning' : 'danger'}>
                        {v.status === 'available' ? 'Tersedia' : v.status === 'in_use' ? 'Sedang Dipakai' : 'Bengkel'}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-4 text-muted">Belum ada mobil di garasi.</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* MODAL REGISTRASI MOBIL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Registrasi Mobil Baru</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddVehicle}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nama Kendaraan (Merek & Model)</Form.Label>
              <Form.Control 
                type="text" 
                required 
                placeholder="Contoh: Toyota Kijang Innova Zenix" 
                value={formData.brand_model} 
                onChange={(e) => setFormData({...formData, brand_model: e.target.value})} 
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nomor Polisi (Plat)</Form.Label>
              <Form.Control 
                type="text" 
                required 
                placeholder="Contoh: B 1234 KFD" 
                value={formData.license_plate} 
                onChange={(e) => setFormData({...formData, license_plate: e.target.value.toUpperCase()})} 
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipe / Kategori</Form.Label>
                  <Form.Select 
                    value={formData.type} 
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="MPV">MPV (Mobil Penumpang)</option>
                    <option value="SUV">SUV (Sport Utility)</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Minibus">Minibus / Elf</option>
                    <option value="Pick Up">Pick Up / Bak</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Kilometer Saat Ini (KM)</Form.Label>
                  <Form.Control 
                    type="number" 
                    required 
                    placeholder="Contoh: 15000" 
                    value={formData.current_odometer} 
                    onChange={(e) => setFormData({...formData, current_odometer: e.target.value})} 
                  />
                </Form.Group>
              </Col>
            </Row>
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