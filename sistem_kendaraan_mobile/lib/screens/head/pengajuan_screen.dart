import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'detail_pengajuan_screen.dart';
import '../../utils/constants.dart';

class PengajuanScreen extends StatefulWidget {
  const PengajuanScreen({super.key});

  @override
  State<PengajuanScreen> createState() => _PengajuanScreenState();
}

class _PengajuanScreenState extends State<PengajuanScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final Color darkBlue = const Color(0xFF0D3B66);
  final Color orangeBakrie = const Color(0xFFF37021);
  final Color bgLight = const Color(0xFFF8F9FA);

  bool _isLoading = true;
  List<dynamic> _allBookings = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _fetchBookingHistory();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchBookingHistory() async {
    try {
      const storage = FlutterSecureStorage();
      String token = await storage.read(key: 'token') ?? '';

      // KUNCI PERUBAHAN: Memanggil AppConstants.baseUrl
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/bookings/history'),
        headers: {'Authorization': 'Bearer $token', 'Accept': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (mounted) {
          setState(() {
            _allBookings = data['data'] ?? [];
            _isLoading = false;
          });
        }
      } else {
        if (mounted) setState(() => _isLoading = false);
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '-';
    try {
      final DateTime date = DateTime.parse(dateStr).toLocal();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
      return "${date.day.toString().padLeft(2, '0')} ${months[date.month - 1]} ${date.year} • ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}";
    } catch (e) {
      return dateStr;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgLight,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text("Riwayat Pengajuan", style: TextStyle(color: darkBlue, fontWeight: FontWeight.bold)),
        bottom: TabBar(
          controller: _tabController,
          labelColor: orangeBakrie,
          unselectedLabelColor: Colors.grey.shade500,
          indicatorColor: orangeBakrie,
          indicatorWeight: 3,
          tabs: const [
            Tab(text: "Menunggu"),
            Tab(text: "Berjalan"),
            Tab(text: "Selesai"),
          ],
        ),
      ),
      body: _isLoading 
        ? Center(child: CircularProgressIndicator(color: orangeBakrie))
        : TabBarView(
            controller: _tabController,
            children: [
              _buildTicketList("pending_assignment"),
              _buildTicketList("on_going"), // Sesuaikan status berjalan DB Anda (on_going atau assigned)
              _buildTicketList("completed"),
            ],
          ),
    );
  }

  Widget _buildTicketList(String targetStatus) {
    // Filter tiket dari API berdasarkan status
    // Tambahkan logika ekstra jika assigned juga dianggap berjalan
    final filteredBookings = _allBookings.where((b) {
      if (targetStatus == "on_going") {
        return b['status'] == 'assigned' || b['status'] == 'on_going';
      }
      return b['status'] == targetStatus;
    }).toList();

    if (filteredBookings.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.assignment_outlined, size: 60, color: Colors.grey.shade300),
            const SizedBox(height: 16),
            Text("Tidak ada tiket di kategori ini", style: TextStyle(color: Colors.grey.shade500)),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _fetchBookingHistory,
      child: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: filteredBookings.length,
        itemBuilder: (context, index) {
          return _buildTicketCard(filteredBookings[index]);
        },
      ),
    );
  }

  Widget _buildTicketCard(Map<String, dynamic> ticket) {
    final status = ticket['status'];
    String displayStatus = status == 'pending_assignment' ? 'Menunggu' : (status == 'completed' ? 'Selesai' : 'Berjalan');
    Color badgeColor = status == 'pending_assignment' ? orangeBakrie : (status == 'completed' ? Colors.green : Colors.blue);
    Color badgeBgColor = status == 'pending_assignment' ? Colors.orange.shade50 : (status == 'completed' ? Colors.green.shade50 : Colors.blue.shade50);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 15, offset: const Offset(0, 5))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const CircleAvatar(
                backgroundColor: Color(0xFFF0F4F8), radius: 22,
                child: Icon(Icons.directions_car, color: Color(0xFF0D3B66)), 
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(ticket['Pemesan']?['name'] ?? 'Karyawan', style: TextStyle(fontWeight: FontWeight.bold, color: darkBlue, fontSize: 15)),
                    Text(ticket['Pemesan']?['Department']?['name'] ?? 'Produksi', style: const TextStyle(color: Colors.grey, fontSize: 12)), 
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: badgeBgColor, borderRadius: BorderRadius.circular(12)),
                child: Text(displayStatus, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: badgeColor)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.location_on, color: Colors.grey.shade400, size: 16),
              const SizedBox(width: 8),
              Expanded(child: Text(ticket['purpose'] ?? '-', style: const TextStyle(fontSize: 12, color: Colors.black87), maxLines: 1, overflow: TextOverflow.ellipsis)),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.calendar_today, color: Colors.grey.shade400, size: 16),
              const SizedBox(width: 8),
              Text(_formatDate(ticket['start_time']), style: const TextStyle(fontSize: 12, color: Colors.black87)),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    Navigator.push(context, MaterialPageRoute(builder: (context) => DetailPengajuanScreen(ticket: ticket)));
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: darkBlue, side: BorderSide(color: darkBlue),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text("Detail", style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }
}