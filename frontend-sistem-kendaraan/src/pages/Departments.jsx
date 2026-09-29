import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Card, Button, Modal, Form } from 'react-bootstrap';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/v1/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data", error);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      // Menembak rute POST untuk menambah data
      await axios.post('http://localhost:5000/api/v1/departments', 
        { name: newDeptName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Tutup modal, kosongkan input, dan refresh tabel
      setShowModal(false);
      setNewDeptName('');
      fetchDepartments(); 
    } catch (error) {
      alert('Gagal menambah departemen: ' + (error.response?.data?.message || 'Error'));
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Master Departemen</h2>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          + Tambah Departemen
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead className="table-light">
              <tr>
                <th width="10%">ID</th>
                <th>Nama Departemen</th>
              </tr>
            </thead>
            <tbody>
              {departments.length > 0 ? (
                departments.map(dept => (
                  <tr key={dept.id}>
                    <td>{dept.id}</td>
                    <td>{dept.name}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="2" className="text-center">Belum ada data.</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Pop-up Modal Form */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tambah Departemen Baru</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddDepartment}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Nama Departemen</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Contoh: Human Resources" 
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
            <Button variant="primary" type="submit">Simpan</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Departments;