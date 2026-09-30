import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Card, Table, Badge, Button, Modal, Form, Navbar, Container, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Approvals = () => {
  const [approvals, setApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const fetchApprovals = useCallback(async () => {
    if (!user.id) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/v1/bookings/approvals/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.data) setApprovals(response.data.data);
    } catch (error) {
      console.log("Gagal mengambil data antrean persetujuan.");
    }
  }, [user.id, token]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleAction = async (id, actionType, reason = '') => {
    // Validasi alasan tolak tidak boleh kosong
    if (actionType === 'reject' && !reason.trim()) {
      return alert("Alasan penolakan wajib diisi!");
    }

    setIsLoading(true);
    try {
      const payload = {
        approver_id: user.id, 
        action: actionType,
        rejection_reason: reason
      };

      await axios.put(`http://localhost:5000/api/v1/bookings/${id}/approval`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`✅ Tiket berhasil di-${actionType === 'approve' ? 'Setujui' : 'Tolak'}!`);
      
      setShowRejectModal(false);
      setRejectionReason('');
      fetchApprovals(); // Refresh antrean tiket
    } catch (error) {
      alert('Gagal memproses tiket: ' + (error.response?.data?.message || 'Error server'));
    } finally {
      setIsLoading(false);
    }
  };

  const openRejectModal = (id) => {
    setSelectedTicketId(id);
    setRejectionReason(''); // Kosongkan form alasan sebelumnya
    setShowRejectModal(true);
  };

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.clear();
      navigate('/');
    }
  };

  const formatDateTime = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="bg-light min-vh-100">
      {/* NAVBAR / HEADER */}
      <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm mb-4">
        <Container fluid className="px-4">
          <Navbar.Brand className="fw-bold">
            👔 Portal Manager (Approval)
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Navbar.Text className="me-4 text-white">
              Halo, <span className="fw-bold">{user.name}</span> <small>({user.nip})</small>
            </Navbar.Text>
            <Button variant="danger" size="sm" onClick={handleLogout} className="px-3 fw-bold">
              Logout
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="px-4 pb-5">
        <h4 className="mb-4 text-secondary fw-bold">Antrean Persetujuan Tiket</h4>

        <Card className="shadow-sm border-0 border-top border-dark border-4">
          <Card.Body className="p-0">
            <Table hover responsive className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Pemesan</th>
                  <th>Tujuan & Keperluan</th>
                  <th>Jadwal Pelaksanaan</th>
                  <th className="text-center pe-4">Keputusan</th>
                </tr>
              </thead>
              <tbody>
                {approvals.length > 0 ? (
                  approvals.map(b => (
                    <tr key={b.id}>
                      {/* KOLOM PEMESAN */}
                      <td className="ps-4">
                        <strong className="d-block text-primary">{b.Pemesan?.name}</strong>
                        <small className="text-muted d-block">NIP: {b.Pemesan?.nip}</small>
                        <Badge bg="secondary" style={{fontSize: '0.65rem'}} className="mt-1">
                          {b.Pemesan?.Department?.name || 'Departemen Tidak Diketahui'}
                        </Badge> <br/>
                        <small className="text-muted fw-bold" style={{fontSize: '0.7rem'}}>Tiket: {b.booking_code}</small>
                      </td>
                      
                      {/* KOLOM TUJUAN & KEPERLUAN */}
                      <td>
                        <Badge bg={b.destination_type === 'luar_kota' ? 'danger' : 'success'} className="me-1 mb-1" style={{fontSize: '0.65rem'}}>
                          {b.destination_type === 'luar_kota' ? 'Luar Kota' : 'Dalam Kota'}
                        </Badge>
                        <strong className="d-block mt-1">{b.destination_address}</strong>
                        <small className="text-muted fst-italic d-block mb-2">"{b.purpose}"</small>
                        
                        {b.return_status === 'tidak_kembali' ? (
                          <Badge bg="danger" className="me-1" style={{fontSize: '0.65rem'}}>📍 Tidak Kembali</Badge>
                        ) : (
                          <Badge bg="info" text="dark" className="me-1" style={{fontSize: '0.65rem'}}>🔄 Kembali ke Kantor</Badge>
                        )}

                        {b.is_carrying_goods && (
                          <Badge bg="warning" text="dark" style={{fontSize: '0.65rem'}}>📦 {b.goods_description}</Badge>
                        )}
                      </td>

                      {/* KOLOM JADWAL */}
                      <td>
                        <small className="d-block"><span className="fw-semibold text-success">Berangkat:</span> {formatDateTime(b.start_time)}</small>
                        <small className="d-block mt-1"><span className="fw-semibold text-danger">Selesai:</span> {formatDateTime(b.end_time)}</small>
                      </td>

                      {/* KOLOM AKSI */}
                      <td className="text-center pe-4">
                        <Button 
                          variant="success" 
                          size="sm" 
                          className="me-2 fw-bold shadow-sm" 
                          onClick={() => handleAction(b.id, 'approve')}
                          disabled={isLoading}
                        >
                          ✅ Setujui
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="fw-bold shadow-sm"
                          onClick={() => openRejectModal(b.id)}
                          disabled={isLoading}
                        >
                          ❌ Tolak
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-5 text-muted">
                      <span className="fs-3 d-block mb-2">☕</span>
                      Hore! Meja Anda bersih. Tidak ada antrean tiket yang menunggu persetujuan.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      {/* MODAL TOLAK TIKET */}
      <Modal show={showRejectModal} onHide={() => !isLoading && setShowRejectModal(false)} centered backdrop="static">
        <Modal.Header closeButton={!isLoading} className="bg-danger text-white">
          <Modal.Title className="fs-5">Tolak Pengajuan Tiket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="fw-semibold">Alasan Penolakan (Wajib Diisi)</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              required
              placeholder="Contoh: Mobil dinas sedang dipakai semua / Tanggal bertabrakan dengan agenda lain..." 
              value={rejectionReason} 
              onChange={(e) => setRejectionReason(e.target.value)}
              disabled={isLoading} 
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowRejectModal(false)} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="danger" onClick={() => handleAction(selectedTicketId, 'reject', rejectionReason)} disabled={isLoading || !rejectionReason.trim()}>
            {isLoading ? <Spinner as="span" animation="border" size="sm" /> : 'Konfirmasi Tolak'}
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default Approvals;