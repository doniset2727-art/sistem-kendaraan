import 'package:flutter/material.dart';

class DetailPengajuanScreen extends StatelessWidget {
  final Map<String, dynamic> ticket;

  const DetailPengajuanScreen({super.key, required this.ticket});

  @override
  Widget build(BuildContext context) {
    final Color darkBlue = const Color(0xFF0D3B66);
    final Color orangeBakrie = const Color(0xFFF37021);
    final Color bgLight = const Color(0xFFF8F9FA);

    // Fungsi format tanggal sederhana
    String formatDate(String? dateStr) {
      if (dateStr == null) return '-';
      try {
        final DateTime date = DateTime.parse(dateStr).toLocal();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        return "${date.day.toString().padLeft(2, '0')} ${months[date.month - 1]} ${date.year} • ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}";
      } catch (e) {
        return dateStr;
      }
    }

    return Scaffold(
      backgroundColor: bgLight,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: darkBlue, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text("Detail Pengajuan", style: TextStyle(color: darkBlue, fontWeight: FontWeight.bold, fontSize: 16)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // --- 1. STATUS PENGAJUAN ---
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Status Tiket", style: TextStyle(color: Colors.grey, fontSize: 13)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(color: Colors.orange.shade50, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.orange.shade200)),
                  child: Row(
                    children: [
                      Icon(Icons.access_time_filled, size: 14, color: orangeBakrie),
                      const SizedBox(width: 6),
                      Text("Menunggu Persetujuan", style: TextStyle(color: orangeBakrie, fontSize: 12, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // --- 2. INFO PEMESAN ---
            Text("Informasi Karyawan", style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: darkBlue)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))]),
              child: Row(
                children: [
                  const CircleAvatar(radius: 24, backgroundColor: Color(0xFFF0F4F8), child: Icon(Icons.person, color: Color(0xFF0D3B66), size: 28)),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(ticket['Pemesan']?['name'] ?? 'Karyawan / User', style: TextStyle(fontWeight: FontWeight.bold, color: darkBlue, fontSize: 16)),
                        const SizedBox(height: 4),
                        const Text("Departemen Produksi", style: TextStyle(color: Colors.grey, fontSize: 13)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // --- 3. DETAIL RUTE & WAKTU ---
            Text("Detail Perjalanan", style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: darkBlue)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))]),
              child: Column(
                children: [
                  // Rute Jemput
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Column(
                        children: [
                          Icon(Icons.trip_origin, color: orangeBakrie, size: 16),
                          Container(height: 30, width: 2, color: Colors.grey.shade300),
                        ],
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text("Titik Jemput", style: TextStyle(color: Colors.grey, fontSize: 12)),
                            const SizedBox(height: 2),
                            Text(ticket['pickup_location'] ?? 'Kantor Pusat Bakrie Autoparts', style: TextStyle(color: darkBlue, fontWeight: FontWeight.w600, fontSize: 14)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  // Rute Tujuan
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(Icons.location_on, color: darkBlue, size: 16),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text("Tujuan", style: TextStyle(color: Colors.grey, fontSize: 12)),
                            const SizedBox(height: 2),
                            Text(ticket['destination'] ?? 'Meeting Point (Sesuai Aplikasi)', style: TextStyle(color: darkBlue, fontWeight: FontWeight.w600, fontSize: 14)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Padding(padding: EdgeInsets.symmetric(vertical: 16), child: Divider(height: 1)),
                  // Waktu
                  Row(
                    children: [
                      Icon(Icons.calendar_today, color: Colors.grey.shade500, size: 18),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text("Waktu Keberangkatan", style: TextStyle(color: Colors.grey, fontSize: 12)),
                            const SizedBox(height: 2),
                            Text(formatDate(ticket['start_time']), style: TextStyle(color: darkBlue, fontWeight: FontWeight.w600, fontSize: 14)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // --- 4. KEPERLUAN ---
            Text("Keperluan", style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: darkBlue)),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))]),
              child: Text(
                ticket['purpose'] ?? 'Tidak ada catatan keperluan tambahan yang dilampirkan oleh pemesan.',
                style: const TextStyle(color: Colors.black87, fontSize: 14, height: 1.5),
              ),
            ),
            const SizedBox(height: 100), // Spasi agar tidak tertutup tombol bawah
          ],
        ),
      ),

      // --- 5. TOMBOL AKSI DI BAWAH ---
      bottomSheet: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))]),
        child: Row(
          children: [
            Expanded(
              flex: 1,
              child: OutlinedButton(
                onPressed: () {
                  // Aksi Tolak
                  Navigator.pop(context);
                },
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  foregroundColor: Colors.red, side: const BorderSide(color: Colors.red),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text("Tolak", style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                onPressed: () {
                  // Aksi Setujui / Buka Bottom Sheet Plotting
                },
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: darkBlue, foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                child: const Text("Setujui & Tugaskan", style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}