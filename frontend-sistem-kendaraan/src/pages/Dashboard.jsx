import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Table, Badge, Row, Col, Form, InputGroup, Button, Modal, ButtonGroup } from 'react-bootstrap';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [reports, setReports] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [chartPeriod, setChartPeriod] = useState('bulan_ini'); 
  
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAllData = async () => {
      const headers = { Authorization: `Bearer ${token}` };
      const fetchSafe = (url, setter) => {
        axios.get(url, { headers })
          .then(res => { if (res.data?.data) setter(res.data.data) })
          .catch(err => console.log(`Menunggu rute backend: ${url}`));
      };
      fetchSafe('http://localhost:5000/api/v1/bookings', setBookings);
      fetchSafe('http://localhost:5000/api/v1/vehicles', setVehicles);
      fetchSafe('http://localhost:5000/api/v1/drivers', setDrivers);
      fetchSafe('http://localhost:5000/api/v1/trip-logs', setReports);
    };
    fetchAllData();
  }, [token]);

  const generateChartData = () => {
    const today = new Date();
    let dataMap = {};

    if (chartPeriod === 'minggu_ini') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dataMap[d.toLocaleDateString('id-ID', { weekday: 'short' })] = { name: d.toLocaleDateString('id-ID', { weekday: 'short' }), biaya: 0, perjalanan: 0 };
      }
    } else if (chartPeriod === 'bulan_ini') {
      dataMap = { 'Minggu 1': { name: 'Minggu 1', biaya: 0, perjalanan: 0 }, 'Minggu 2': { name: 'Minggu 2', biaya: 0, perjalanan: 0 }, 'Minggu 3': { name: 'Minggu 3', biaya: 0, perjalanan: 0 }, 'Minggu 4': { name: 'Minggu 4', biaya: 0, perjalanan: 0 } };
    } else if (chartPeriod === 'tahun_ini') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
      months.forEach(m => dataMap[m] = { name: m, biaya: 0, perjalanan: 0 });
    }

    reports.forEach(r => {
      const d = new Date(r.created_at || r.createdAt || new Date());
      const totalCost = Number(r.fuel_cost||0) + Number(r.toll_cost||0) + Number(r.parking_cost||0) + Number(r.other_cost||0);
      
      if (chartPeriod === 'tahun_ini' && d.getFullYear() === today.getFullYear()) {
        const month = d.toLocaleDateString('id-ID', { month: 'short' });
        if (dataMap[month]) dataMap[month].biaya += totalCost;
      } 
      else if (chartPeriod === 'bulan_ini' && d.getMonth() === today.getMonth()) {
        const week = Math.ceil(d.getDate() / 7);
        const weekKey = `Minggu ${week > 4 ? 4 : week}`;
        if (dataMap[weekKey]) dataMap[weekKey].biaya += totalCost;
      }
      else if (chartPeriod === 'minggu_ini') {
        const diffTime = Math.abs(today - d);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
          const day = d.toLocaleDateString('id-ID', { weekday: 'short' });
          if (dataMap[day]) dataMap[day].biaya += totalCost;
        }
      }
    });

    bookings.forEach(b => {
      const d = new Date(b.created_at || b.createdAt || new Date());
      if (chartPeriod === 'tahun_ini' && d.getFullYear() === today.getFullYear()) {
        const month = d.toLocaleDateString('id-ID', { month: 'short' });
        if (dataMap[month]) dataMap[month].perjalanan += 1;
      } 
      else if (chartPeriod === 'bulan_ini' && d.getMonth() === today.getMonth()) {
        const week = Math.ceil(d.getDate() / 7);
        const weekKey = `Minggu ${week > 4 ? 4 : week}`;
        if (dataMap[weekKey]) dataMap[weekKey].perjalanan += 1;
      }
    });

    return Object.values(dataMap);
  };
  
  const chartData = generateChartData();

  const handleExportLaporanBiaya = () => {
    const headers = "ID Trip,Nama Supir,Kendaraan,KM Awal,KM Akhir,Bensin (Rp),Tol (Rp),Parkir (Rp),Lain-lain (Rp),Total Biaya (Rp)\n";
    const rows = reports.map(r => {
      const supir = r.Driver?.User?.name || '-';
      const mobil = r.Booking?.Assignment?.Vehicle?.license_plate || '-';
      const total = Number(r.fuel_cost||0) + Number(r.toll_cost||0) + Number(r.parking_cost||0) + Number(r.other_cost||0);
      return `${r.id},"${supir}","${mobil}",${r.start_odometer||0},${r.end_odometer||0},${r.fuel_cost||0},${r.toll_cost||0},${r.parking_cost||0},${r.other_cost||0},${total}`;
    }).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `Laporan_Biaya_${new Date().toISOString().slice(0,10)}.csv`; link.click();
  };

  // 👇 FITUR EXPORT RADAR SUDAH DIUPDATE (Menambah Pemesan & Departemen & Supir & Mobil) 👇
  const handleExportRiwayatPerjalanan = () => {
    const headers = "Kode Booking,Pemesan,Departemen,Tgl Berangkat,Tujuan,Supir,Kendaraan,Status\n";
    const rows = bookings.map(b => {
      const pemesan = b.User?.name || '-';
      const departemen = b.User?.Department?.name || '-';
      const supir = b.Assignment?.Driver?.User?.name || 'Belum Diplot';
      const kendaraan = b.Assignment?.Vehicle?.license_plate || 'Belum Diplot';
      return `${b.booking_code},"${pemesan}","${departemen}",${new Date(b.start_time).toLocaleDateString('id-ID')},"${b.destination_address}","${supir}","${kendaraan}",${b.status}`;
    }).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `Live_Radar_${new Date().toISOString().slice(0,10)}.csv`; link.click();
  };

  // 👇 FITUR SEARCH JUGA BISA MENCARI NAMA PEMESAN 👇
  const filteredBookings = bookings.filter((b) => {
    const matchSearch = b.destination_address?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        b.booking_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.User?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterStatus === 'all' || b.status === filterStatus;
    return matchSearch && matchFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_approval': return <Badge bg="warning" text="dark">Menunggu Atasan</Badge>;
      case 'pending_assignment': return <Badge bg="info">Menunggu Plotting</Badge>;
      case 'assigned': return <Badge bg="primary">Telah Diplot</Badge>;
      case 'on_going': return <Badge bg="success">Sedang Jalan</Badge>;
      case 'completed': return <Badge bg="secondary">Selesai</Badge>;
      default: return <Badge bg="light" text="dark">{status}</Badge>;
    }
  };

  return (
    <div>
      <h2 className="mb-4 mt-3">Pusat Kendali & Analitik Operasional</h2>

      {/* RESOURCE WIDGET */}
      <Row className="mb-4">
        <Col md={6}>
          <div className="bg-white p-3 rounded shadow-sm border-start border-4 border-info">
            <h6 className="text-muted fw-bold mb-2">🚗 Ketersediaan Garasi</h6>
            <span className="me-3">Total: <strong>{vehicles.length}</strong></span>
            <span className="me-3 text-success">🟢 Standby: <strong>{vehicles.filter(v => v.status === 'available').length}</strong></span>
            <span className="me-3 text-warning">🟡 Keluar: <strong>{vehicles.filter(v => v.status === 'in_use').length}</strong></span>
            <span className="text-danger">🔴 Bengkel: <strong>{vehicles.filter(v => v.status === 'maintenance').length}</strong></span>
          </div>
        </Col>
        <Col md={6}>
          <div className="bg-white p-3 rounded shadow-sm border-start border-4 border-success">
            <h6 className="text-muted fw-bold mb-2">👨‍✈️ Ketersediaan Supir</h6>
            <span className="me-3">Total: <strong>{drivers.length}</strong></span>
            <span className="me-3 text-success">🟢 Standby: <strong>{drivers.filter(d => d.status === 'available').length}</strong></span>
            <span className="me-3 text-warning">🟡 Bertugas: <strong>{drivers.filter(d => d.status === 'on_duty').length}</strong></span>
            <span className="text-secondary">⚪ Libur: <strong>{drivers.filter(d => d.status === 'off').length}</strong></span>
          </div>
        </Col>
      </Row>

      {/* PANEL GRAFIK ANALITIK */}
      <Card className="shadow-sm border-0 mb-4 bg-white">
        <Card.Header className="bg-white border-bottom pt-3 pb-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-muted fw-bold">📈 Grafik Analitik Eksekutif</h5>
          <ButtonGroup size="sm">
            <Button variant={chartPeriod === 'minggu_ini' ? 'primary' : 'outline-primary'} onClick={() => setChartPeriod('minggu_ini')}>7 Hari Terakhir</Button>
            <Button variant={chartPeriod === 'bulan_ini' ? 'primary' : 'outline-primary'} onClick={() => setChartPeriod('bulan_ini')}>Bulan Ini</Button>
            <Button variant={chartPeriod === 'tahun_ini' ? 'primary' : 'outline-primary'} onClick={() => setChartPeriod('tahun_ini')}>Tahun Ini</Button>
          </ButtonGroup>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6 className="text-center text-muted mb-3">Tren Biaya Operasional (Rp)</h6>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                  <Legend />
                  <Bar dataKey="biaya" name="Total Biaya" fill="#dc3545" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Col>
            <Col md={6}>
              <h6 className="text-center text-muted mb-3">Frekuensi Perjalanan Operasional</h6>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="perjalanan" name="Jumlah Perjalanan" stroke="#0d6efd" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* TABEL LAPORAN BIAYA */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white border-bottom pt-3 pb-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 text-muted fw-bold">💰 Rincian Biaya Operasional</h5>
            <Button variant="success" size="sm" onClick={handleExportLaporanBiaya}>📥 Export Excel (Biaya)</Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Table striped hover responsive className="align-middle" size="sm">
            <thead className="table-light">
              <tr>
                <th>Nama Supir</th>
                <th>Kendaraan</th>
                <th>KM Awal</th>
                <th>KM Akhir</th>
                <th>Bensin (Rp)</th>
                <th>Tol (Rp)</th>
                <th>Parkir (Rp)</th>
                <th>Lain-lain (Rp)</th>
                <th className="bg-light">Total (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? (
                reports.map((report) => {
                  const total = Number(report.fuel_cost||0) + Number(report.toll_cost||0) + Number(report.parking_cost||0) + Number(report.other_cost||0);
                  return (
                    <tr key={report.id}>
                      <td className="fw-bold">{report.Driver?.User?.name || 'Menunggu Relasi'}</td>
                      <td>{report.Booking?.Assignment?.Vehicle?.license_plate || '-'}</td>
                      <td>{report.start_odometer || 0}</td>
                      <td>{report.end_odometer || 0}</td>
                      <td className="text-danger">{Number(report.fuel_cost || 0).toLocaleString('id-ID')}</td>
                      <td className="text-warning">{Number(report.toll_cost || 0).toLocaleString('id-ID')}</td>
                      <td className="text-info">{Number(report.parking_cost || 0).toLocaleString('id-ID')}</td>
                      <td className="text-secondary">{Number(report.other_cost || 0).toLocaleString('id-ID')}</td>
                      <td className="fw-bold text-primary bg-light">{total.toLocaleString('id-ID')}</td>
                    </tr>
                  )
                })
              ) : (
                <tr><td colSpan="9" className="text-center py-4 text-muted">Belum ada data laporan biaya yang diinput.</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* 👇 TABEL LIVE RADAR SUDAH DIUPDATE KOLOMNYA 👇 */}
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white border-bottom pt-3 pb-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 text-muted fw-bold">🔴 Live Radar: Riwayat Perjalanan</h5>
            <div className="d-flex gap-2">
              <InputGroup size="sm" style={{ width: '280px' }}>
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control placeholder="Cari Kode / Tujuan / Pemesan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </InputGroup>
              <Form.Select size="sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '130px' }}>
                <option value="all">Semua Status</option>
                <option value="on_going">Sedang Jalan</option>
                <option value="completed">Selesai</option>
              </Form.Select>
              <Button variant="success" size="sm" onClick={handleExportRiwayatPerjalanan}>📥 Export Excel (Radar)</Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <Table striped hover responsive className="align-middle" size="sm">
            <thead className="table-light">
              <tr>
                <th>Kode Booking</th>
                <th>Pemesan</th>
                <th>Departemen</th>
                <th>Tgl Berangkat</th>
                <th>Tujuan</th>
                <th>Supir</th>
                <th>Kendaraan</th>
                <th>Status</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="fw-bold text-primary">{booking.booking_code}</td>
                    
                    {/* Tambahan Kolom Pemesan dan Departemen */}
                    <td className="fw-bold">{booking.User?.name || 'Menunggu Relasi'}</td>
                    <td>{booking.User?.Department?.name || '-'}</td>
                    
                    <td>{new Date(booking.start_time).toLocaleDateString('id-ID')}</td>
                    <td>
                      <Badge bg={booking.destination_type === 'luar_kota' ? 'danger' : 'info'} className="me-2">
                        {booking.destination_type === 'luar_kota' ? 'LK' : 'DK'}
                      </Badge>
                      {booking.destination_address}
                    </td>
                    
                    {/* Tambahan Kolom Supir dan Kendaraan */}
                    <td>{booking.Assignment?.Driver?.User?.name || <span className="fst-italic text-muted">Belum Diplot</span>}</td>
                    <td>{booking.Assignment?.Vehicle?.license_plate || <span className="fst-italic text-muted">Belum Diplot</span>}</td>
                    
                    <td>{getStatusBadge(booking.status)}</td>
                    <td className="text-center">
                      <Button variant="light" size="sm" onClick={() => { setSelectedBooking(booking); setShowModal(true); }}>👁️</Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="9" className="text-center py-5 text-muted">Belum ada aktivitas pemesanan.</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* MODAL DETAIL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light"><Modal.Title>Detail: {selectedBooking?.booking_code}</Modal.Title></Modal.Header>
        <Modal.Body>
          {selectedBooking && (<p><strong>Tujuan:</strong> {selectedBooking.destination_address} <br/> <strong>Keperluan:</strong> {selectedBooking.purpose}</p>)}
        </Modal.Body>
      </Modal>

    </div>
  );
};

export default Dashboard;