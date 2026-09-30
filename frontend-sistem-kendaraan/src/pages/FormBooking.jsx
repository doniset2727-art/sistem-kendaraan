import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Card, Table, Badge, Button, Form, Row, Col, Navbar, Container, Pagination, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const FormBooking = () => {
  const [myBookings, setMyBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [formData, setFormData] = useState({
    destination_type: 'dalam_kota',
    destination_address: '',
    purpose: '',
    is_carrying_goods: false,
    goods_description: '',
    return_status: 'kembali',
    start_time: '',
    end_time: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  // --- LOGIKA BATASAN KALENDER ---
  
  // 1. Batas Minimal (Hari Ini / Waktu Sekarang)
  const getLocalMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  // 2. Batas Maksimal (H+3 dari Hari Ini)
  const getLocalMaxDateTime = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 3); // Tambah 3 Hari
    maxDate.setMinutes(maxDate.getMinutes() - maxDate.getTimezoneOffset());
    return maxDate.toISOString().slice(0, 16);
  };

  const minDateTime = getLocalMinDateTime();
  const maxDateTime = getLocalMaxDateTime(); // Kita gunakan ini untuk kalender berangkat

  const fetchMyBookings = useCallback(async () => {
    if (!user.id) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/v1/bookings/my-bookings/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data?.data) setMyBookings(response.data.data);
    } catch (error) {
      console.log("Gagal mengambil riwayat tiket.");
    }
  }, [user.id, token]);

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const startTime = new Date(formData.start_time);
    const endTime = new Date(formData.end_time);
    const now = new Date();

    // 🔴 Validasi 1: Waktu Berangkat di Masa Lalu
    if (startTime < now) {
      return alert('🚫 Gagal: Waktu berangkat tidak boleh di masa lalu!');
    }

    // 🔴 Validasi 2: Maksimal H+3 (Anti-Timbun Booking)
    const maxAllowed = new Date();
    maxAllowed.setDate(maxAllowed.getDate() + 3); // Toleransi sampai H+3
    if (startTime > maxAllowed) {
      return alert('🚫 Gagal: Anda hanya dapat melakukan pemesanan kendaraan maksimal untuk H+3 dari hari ini!');
    }
    
    // 🔴 Validasi 3: Logika Waktu Selesai
    if (endTime <= startTime) {
      return alert('🚫 Gagal: Waktu selesai harus lebih lambat dari waktu berangkat!');
    }

    setIsLoading(true);
    
    try {
      const payload = { ...formData, user_id: user.id };
      await axios.post('http://localhost:5000/api/v1/bookings', payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      alert('✅ Tiket pesanan berhasil dibuat dan diteruskan ke Atasan!');
      
      setFormData({
        destination_type: 'dalam_kota', destination_address: '', purpose: '',
        is_carrying_goods: false, goods_description: '', return_status: 'kembali',
        start_time: '', end_time: ''
      });
      
      setCurrentPage(1); 
      fetchMyBookings(); 
    } catch (error) {
      alert('Gagal membuat pesanan: ' + (error.response?.data?.message || 'Terjadi kesalahan'));
    } finally {
      setIsLoading(false); 
    }
  };

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.clear();
      navigate('/');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_approval': return <Badge bg="warning" text="dark">Menunggu Atasan</Badge>;
      case 'pending_assignment': return <Badge bg="info">Antre di Pool</Badge>;
      case 'assigned': return <Badge bg="primary">Telah Diplot</Badge>;
      case 'on_going': return <Badge bg="success">Sedang Jalan</Badge>;
      case 'completed': return <Badge bg="secondary">Selesai</Badge>;
      case 'rejected': return <Badge bg="danger">Ditolak Atasan</Badge>;
      default: return <Badge bg="light" text="dark">{status}</Badge>;
    }
  };

  const formatDateTime = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = myBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(myBookings.length / itemsPerPage);

  const renderPagination = () => {
    if (totalPages <= 1) return null; 
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item key={number} active={number === currentPage} onClick={() => setCurrentPage(number)}>
          {number}
        </Pagination.Item>
      );
    }
    return (
      <Pagination size="sm" className="mb-0 justify-content-center mt-3">
        <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} />
        {items}
        <Pagination.Next onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} />
      </Pagination>
    );
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm mb-4">
        <Container fluid className="px-4">
          <Navbar.Brand className="fw-bold">🏢 Portal Karyawan</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Navbar.Text className="me-4 text-white">
              Halo, <span className="fw-bold">{user.name}</span> <small>({user.nip})</small>
            </Navbar.Text>
            <Button variant="danger" size="sm" onClick={handleLogout} className="px-3 fw-bold">Logout</Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="px-4 pb-5">
        <Row>
          <Col lg={4}>
            <Card className="shadow-sm border-0 border-top border-primary border-4 mb-4">
              <Card.Header className="bg-white py-3">
                <h5 className="mb-0 fw-bold text-primary">Buat Pesanan Baru</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-secondary">Tujuan</Form.Label>
                    <Form.Control type="text" required placeholder="Contoh: Gedung Sate, Bandung" value={formData.destination_address} onChange={(e) => setFormData({...formData, destination_address: e.target.value})} />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-secondary">Jenis Perjalanan</Form.Label>
                        <Form.Select value={formData.destination_type} onChange={(e) => setFormData({...formData, destination_type: e.target.value})}>
                          <option value="dalam_kota">Dalam Kota (DK)</option>
                          <option value="luar_kota">Luar Kota (LK)</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-secondary">Kepulangan</Form.Label>
                        <Form.Select value={formData.return_status} onChange={(e) => setFormData({...formData, return_status: e.target.value})}>
                          <option value="kembali">Kembali ke Kantor</option>
                          <option value="tidak_kembali">Tidak Kembali</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-secondary">Waktu Berangkat</Form.Label>
                        {/* 👇 ATRIBUT MAX DITAMBAHKAN DI SINI (Kunci Kalender) 👇 */}
                        <Form.Control type="datetime-local" min={minDateTime} max={maxDateTime} required value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-secondary">Waktu Selesai</Form.Label>
                        {/* Waktu selesai dibiarkan bebas (siapa tau trip dinasnya 5 hari), tapi minimal harus setelah waktu berangkat */}
                        <Form.Control type="datetime-local" min={formData.start_time || minDateTime} required value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-secondary">Keperluan Dinas</Form.Label>
                    <Form.Control as="textarea" rows={2} required placeholder="Contoh: Meeting dengan Klien A" value={formData.purpose} onChange={(e) => setFormData({...formData, purpose: e.target.value})} />
                  </Form.Group>

                  <Form.Group className="mb-4 bg-light p-2 rounded border">
                    <Form.Check type="checkbox" label="Membawa Barang/Alat Berat?" className="fw-semibold text-secondary" checked={formData.is_carrying_goods} onChange={(e) => setFormData({...formData, is_carrying_goods: e.target.checked})} />
                  </Form.Group>

                  {formData.is_carrying_goods && (
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-secondary">Deskripsi Barang</Form.Label>
                      <Form.Control type="text" required placeholder="Contoh: 2 Kardus Brosur" value={formData.goods_description} onChange={(e) => setFormData({...formData, goods_description: e.target.value})} />
                    </Form.Group>
                  )}

                  <Button variant="primary" type="submit" className="w-100 fw-bold py-2 mt-2" disabled={isLoading}>
                    {isLoading ? (
                      <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> Memproses...</>
                    ) : (
                      "🚀 Kirim Pengajuan Tiket"
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Card className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-white py-3">
                <h5 className="mb-0 fw-bold text-secondary">Riwayat Tiket Saya</h5>
              </Card.Header>
              <Card.Body className="p-3">
                <Table hover responsive className="align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-2">Kode Tiket</th>
                      <th>Tujuan & Keperluan</th>
                      <th>Waktu Pelaksanaan</th>
                      <th>Status</th>
                      <th>Supir & Mobil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBookings.length > 0 ? (
                      currentBookings.map(b => (
                        <tr key={b.id}>
                          <td className="ps-2 fw-bold text-primary">{b.booking_code}</td>
                          <td>
                            <strong className="d-block">{b.destination_address}</strong>
                            <small className="text-muted fst-italic d-block mb-2">"{b.purpose}"</small>
                            
                            {b.return_status === 'tidak_kembali' ? (
                              <Badge bg="danger" className="me-1 mb-1" style={{fontSize: '0.7rem'}}>📍 Tidak Kembali</Badge>
                            ) : (
                              <Badge bg="info" text="dark" className="me-1 mb-1" style={{fontSize: '0.7rem'}}>🔄 Kembali ke Kantor</Badge>
                            )}

                            {b.is_carrying_goods && (
                              <Badge bg="warning" text="dark" className="mb-1" style={{fontSize: '0.7rem'}}>📦 {b.goods_description}</Badge>
                            )}
                          </td>
                          <td>
                            <small className="d-block"><span className="fw-semibold text-success">Mulai:</span> {formatDateTime(b.start_time)}</small>
                            <small className="d-block mt-1"><span className="fw-semibold text-danger">Selesai:</span> {formatDateTime(b.end_time)}</small>
                          </td>
                          <td>{getStatusBadge(b.status)}</td>
                          <td>
                            {b.Assignment ? (
                              <span className="fw-bold text-success">
                                {b.Assignment.Driver?.User?.name || '-'} <br/>
                                <small className="text-muted">({b.Assignment.Vehicle?.license_plate || '-'})</small>
                              </span>
                            ) : (
                              <span className="fst-italic text-muted">Belum ditugaskan</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5" className="text-center py-5 text-muted">Anda belum memiliki riwayat pemesanan.</td></tr>
                    )}
                  </tbody>
                </Table>
                
                {renderPagination()}
                
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default FormBooking;