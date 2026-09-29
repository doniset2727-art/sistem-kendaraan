import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Table, Badge, Button, InputGroup, Form } from 'react-bootstrap';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/v1/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data?.data) setTrips(response.data.data);
      } catch (error) {
        console.log("Menunggu backend...");
      }
    };
    fetchTrips();
  }, [token]);

  const filteredTrips = trips.filter((t) => 
    t.booking_code?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.destination_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.User?.name?.toLowerCase().includes(searchTerm.toLowerCase()) // Asumsi relasi ke User (Pemesan) sudah ada di backend
  );

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

  const handleExport = () => {
    const headers = "Kode Booking,Pemesan,Departemen,Tgl Mulai,Tgl Selesai,Tujuan,Supir,Kendaraan,Status\n";
    const rows = filteredTrips.map(t => {
      const pemesan = t.User?.name || '-';
      const departemen = t.User?.Department?.name || '-'; // Asumsi relasi Departemen ada
      const supir = t.Assignment?.Driver?.User?.name || 'Belum Diplot';
      const kendaraan = t.Assignment?.Vehicle?.license_plate || 'Belum Diplot';
      return `${t.booking_code},"${pemesan}","${departemen}",${new Date(t.start_time).toLocaleDateString('id-ID')},${new Date(t.end_time).toLocaleDateString('id-ID')},"${t.destination_address}","${supir}","${kendaraan}",${t.status}`;
    }).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Arsip_Perjalanan.csv`;
    link.click();
  };

  return (
    <div>
      <h2 className="mb-4 mt-3">Arsip & Riwayat Perjalanan</h2>
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-bottom pt-3 pb-3 d-flex justify-content-between align-items-center">
          <InputGroup size="sm" style={{ width: '300px' }}>
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control placeholder="Cari Kode / Tujuan / Nama Pemesan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </InputGroup>
          <Button variant="success" size="sm" onClick={handleExport}>📥 Export CSV</Button>
        </Card.Header>
        <Card.Body>
          <Table striped hover responsive className="align-middle" size="sm">
            <thead className="table-light">
              <tr>
                <th>Kode Booking</th>
                <th>Pemesan</th>
                <th>Departemen</th>
                <th>Tgl Mulai</th>
                <th>Tgl Selesai</th>
                <th>Tujuan</th>
                <th>Supir</th>
                <th>Kendaraan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.length > 0 ? (
                filteredTrips.map(trip => (
                  <tr key={trip.id}>
                    <td className="fw-bold text-primary">{trip.booking_code}</td>
                    <td className="fw-bold">{trip.User?.name || 'Menunggu Relasi'}</td>
                    <td>{trip.User?.Department?.name || '-'}</td>
                    <td>{new Date(trip.start_time).toLocaleDateString('id-ID')}</td>
                    <td>{new Date(trip.end_time).toLocaleDateString('id-ID')}</td>
                    <td>{trip.destination_address}</td>
                    <td>{trip.Assignment?.Driver?.User?.name || <span className="fst-italic text-muted">Belum Diplot</span>}</td>
                    <td>{trip.Assignment?.Vehicle?.license_plate || <span className="fst-italic text-muted">Belum Diplot</span>}</td>
                    <td>{getStatusBadge(trip.status)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="9" className="text-center py-4 text-muted">Belum ada riwayat perjalanan.</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Trips;