import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Table, Badge, Button, InputGroup, Form } from 'react-bootstrap';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/v1/trip-logs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data?.data) setReports(response.data.data);
      } catch (error) {
        console.log("Menunggu backend...");
      }
    };
    fetchReports();
  }, [token]);

  // Bisa mencari berdasarkan NIP Supir
  const filteredReports = reports.filter((r) => {
    const searchLower = searchTerm.toLowerCase();
    return r.Driver?.User?.name?.toLowerCase().includes(searchLower) ||
           r.Driver?.User?.nip?.toLowerCase().includes(searchLower) ||
           r.Booking?.Assignment?.Vehicle?.license_plate?.toLowerCase().includes(searchLower);
  });

  const handleExport = () => {
    const headers = "ID Trip,Nama Supir,Kendaraan,KM Awal,KM Akhir,Bensin (Rp),Tol (Rp),Parkir (Rp),Lain-lain (Rp),Total (Rp),Status Validasi\n";
    const rows = filteredReports.map(r => {
      const supir = r.Driver?.User?.name ? `${r.Driver.User.name} - ${r.Driver.User.nip}` : '-';
      const mobil = r.Booking?.Assignment?.Vehicle?.license_plate || '-';
      const total = Number(r.fuel_cost||0) + Number(r.toll_cost||0) + Number(r.parking_cost||0) + Number(r.other_cost||0);
      return `${r.id},"${supir}","${mobil}",${r.start_odometer||0},${r.end_odometer||0},${r.fuel_cost||0},${r.toll_cost||0},${r.parking_cost||0},${r.other_cost||0},${total},${r.validation_status}`;
    }).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_Biaya.csv`;
    link.click();
  };

  return (
    <div>
      <h2 className="mb-4 mt-3">Laporan Biaya Operasional</h2>
      <Card className="shadow-sm border-0 bg-light mb-4">
        <Card.Body>
          <p className="mb-0 text-muted">
            Di halaman ini Admin Kendaraan dapat melihat rincian pengeluaran operasional dan memvalidasi struk yang diunggah supir.
          </p>
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-bottom pt-3 pb-3 d-flex justify-content-between align-items-center">
          <InputGroup size="sm" style={{ width: '300px' }}>
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control placeholder="Cari Nama Supir / NIP / Plat..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </InputGroup>
          <Button variant="success" size="sm" onClick={handleExport}>📥 Export CSV</Button>
        </Card.Header>
        <Card.Body>
          <Table striped hover responsive className="align-middle" size="sm">
            <thead className="table-dark">
              <tr>
                <th>Nama Supir</th>
                <th>Kendaraan</th>
                <th>KM Awal</th>
                <th>KM Akhir</th>
                <th>Bensin (Rp)</th>
                <th>Tol (Rp)</th>
                <th>Parkir (Rp)</th>
                <th>Lain-lain (Rp)</th>
                <th className="bg-secondary">Total (Rp)</th>
                <th>Status Validasi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length > 0 ? (
                filteredReports.map(report => {
                  const total = Number(report.fuel_cost||0) + Number(report.toll_cost||0) + Number(report.parking_cost||0) + Number(report.other_cost||0);
                  return (
                    <tr key={report.id}>
                      {/* NIP SUPIR DITAMPILKAN DI SINI */}
                      <td className="fw-bold">
                        {report.Driver?.User?.name ? `${report.Driver.User.name} - ${report.Driver.User.nip}` : 'Menunggu Relasi'}
                      </td>
                      <td>{report.Booking?.Assignment?.Vehicle?.license_plate || '-'}</td>
                      <td>{report.start_odometer || 0}</td>
                      <td>{report.end_odometer || 0}</td>
                      <td className="text-danger">{Number(report.fuel_cost || 0).toLocaleString('id-ID')}</td>
                      <td className="text-warning">{Number(report.toll_cost || 0).toLocaleString('id-ID')}</td>
                      <td className="text-info">{Number(report.parking_cost || 0).toLocaleString('id-ID')}</td>
                      <td className="text-secondary">{Number(report.other_cost || 0).toLocaleString('id-ID')}</td>
                      <td className="fw-bold text-primary bg-light">{total.toLocaleString('id-ID')}</td>
                      <td>
                        <Badge bg={report.validation_status === 'validated' ? 'success' : report.validation_status === 'rejected' ? 'danger' : 'warning'}>
                          {report.validation_status}
                        </Badge>
                      </td>
                      <td><Button variant="outline-primary" size="sm">Cek Struk</Button></td>
                    </tr>
                  )
                })
              ) : (
                <tr><td colSpan="11" className="text-center py-4 text-muted">Belum ada laporan biaya yang masuk.</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Reports;