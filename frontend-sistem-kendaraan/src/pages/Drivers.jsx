import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Card, Table, Badge, Button, Modal, Form, Row, Col } from 'react-bootstrap';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    nip: '',
    email: '',
    password: '',
    sim_number: '',
    sim_expiry: ''
  });

  const token = localStorage.getItem('token');

  const fetchDrivers = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/drivers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.data) setDrivers(response.data.data);
    } catch (error) {
      console.log("Menunggu backend API drivers disiapkan.");
    }
  }, [token]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleAddDriver = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/v1/drivers', formData, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      alert('Supir berhasil didaftarkan!');
      setShowModal(false);
      setFormData({ name: '', nip: '', email: '', password: '', sim_number: '', sim_expiry: '' });
      fetchDrivers(); 
    } catch (error) {
      alert('Gagal menambah supir: ' + (error.response?.data?.message || 'Pastikan rute POST backend sudah siap!'));
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
        <h2>Data Supir</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          + Daftarkan Supir Baru
        </Button>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <Table striped hover responsive className="align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>NIP</th>
                <th>Nama Supir</th>
                <th>Nomor SIM</th>
                <th>Masa Berlaku</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {drivers.length > 0 ? (
                drivers.map(d => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.User?.nip || '-'}</td>
                    <td className="fw-bold">{d.User?.name || 'Menunggu Relasi Backend'}</td>
                    <td>{d.sim_number}</td>
                    <td>{d.sim_expiry}</td>
                    <td>
                      <Badge bg={d.status === 'available' ? 'success' : 'warning'}>
                        {d.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-4 text-muted">Belum ada data supir di garasi.</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>Registrasi Supir Baru</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddDriver}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <h6 className="border-bottom pb-2 mb-3 text-muted">Informasi Akun (Untuk Login App Mobile)</h6>
                <Form.Group className="mb-3">
                  <Form.Label>Nama Lengkap</Form.Label>
                  <Form.Control type="text" required placeholder="Contoh: Budi Santoso" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>NIP (Nomor Induk Pegawai)</Form.Label>
                  <Form.Control type="text" required placeholder="Contoh: 199801022020011001" value={formData.nip} onChange={(e) => setFormData({...formData, nip: e.target.value})} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email (Opsional)</Form.Label>
                  <Form.Control type="email" placeholder="Contoh: budi@perusahaan.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password Default</Form.Label>
                  <Form.Control type="password" required placeholder="Buatkan password sementara" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <h6 className="border-bottom pb-2 mb-3 text-muted">Informasi Kelengkapan Berkas</h6>
                <Form.Group className="mb-3">
                  <Form.Label>Nomor SIM A / B1</Form.Label>
                  <Form.Control type="text" required placeholder="Contoh: 1234-5678-9012" value={formData.sim_number} onChange={(e) => setFormData({...formData, sim_number: e.target.value})} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Masa Berlaku SIM</Form.Label>
                  <Form.Control type="date" required value={formData.sim_expiry} onChange={(e) => setFormData({...formData, sim_expiry: e.target.value})} />
                </Form.Group>
                <div className="alert alert-info mt-4" style={{ fontSize: '0.85rem' }}>
                  <strong>Catatan:</strong> Setelah disimpan, sistem akan otomatis membuatkan akun agar supir dapat login menggunakan NIP ke Aplikasi Mobile.
                </div>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowModal(false)}>Batal</Button>
            <Button variant="primary" type="submit">Simpan & Daftarkan</Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </div>
  );
};

export default Drivers;