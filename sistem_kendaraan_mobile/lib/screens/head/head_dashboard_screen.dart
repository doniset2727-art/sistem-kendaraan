import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import '../../utils/constants.dart';
import '../login_screen.dart';
import '../../widgets/plotting_bottom_sheet.dart'; 
import 'detail_pengajuan_screen.dart';
import 'pengajuan_screen.dart'; 
import 'notification_screen.dart';

class HeadDashboardScreen extends StatefulWidget {
  const HeadDashboardScreen({super.key});

  @override
  State<HeadDashboardScreen> createState() => _HeadDashboardScreenState();
}

class _HeadDashboardScreenState extends State<HeadDashboardScreen> {
  String _nama = "Memuat...";
  String _token = "";
  String _userId = ""; // Tambahan untuk memanggil API Notif
  
  bool _isLoadingData = true;
  List<dynamic> _pendingTickets = [];
  List<dynamic> _availableVehicles = [];
  List<dynamic> _availableDrivers = [];

  int _totalVehicles = 0;
  int _availableVehiclesCount = 0;
  int _inUseVehiclesCount = 0;
  int _maintenanceVehiclesCount = 0;

  int _menungguPersetujuanCount = 0;
  int _perluDitugaskanCount = 0;
  int _sedangBerjalanCount = 0;
  
  int _unreadNotifCount = 0; // Tambahan untuk badge lonceng

  final Color darkBlue = const Color(0xFF0D3B66);
  final Color orangeBakrie = const Color(0xFFF37021);
  final Color bgLight = const Color(0xFFF8F9FA);

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

 Future<void> _loadUserData() async {
    const storage = FlutterSecureStorage();
    final nama = await storage.read(key: 'nama');
    final token = await storage.read(key: 'token');
    final id = await storage.read(key: 'id');

    setState(() {
      _nama = nama ?? 'Kepala Bagian';
      _token = token ?? '';
      _userId = id ?? '';
    });
    
    if (_token.isNotEmpty) {
      _fetchDashboardData();
    } else {
      setState(() => _isLoadingData = false);
    }
  }

  Future<void> _fetchDashboardData() async {
    try {
      final headers = {'Authorization': 'Bearer $_token', 'Accept': 'application/json'};

      // Tambahkan API Notifikasi ke antrean eksekusi
      final futures = [
        http.get(Uri.parse('${AppConstants.baseUrl}/bookings/pool/pending-assignments'), headers: headers),
        http.get(Uri.parse('${AppConstants.baseUrl}/bookings/pool/master-data'), headers: headers),
        http.get(Uri.parse('${AppConstants.baseUrl}/vehicles'), headers: headers),
        http.get(Uri.parse('${AppConstants.baseUrl}/bookings/history'), headers: headers),
      ];

      if (_userId.isNotEmpty) {
        futures.add(http.get(Uri.parse('${AppConstants.baseUrl}/notifications/user/$_userId'), headers: headers));
      }

      final results = await Future.wait(futures).timeout(const Duration(seconds: 15));

      if (mounted) {
        setState(() {
          if (results[0].statusCode == 200) _pendingTickets = jsonDecode(results[0].body)['data'] ?? [];
          
          if (results[1].statusCode == 200) {
            final masterData = jsonDecode(results[1].body)['data'];
            _availableVehicles = masterData?['vehicles'] ?? [];
            _availableDrivers = masterData?['drivers'] ?? [];
          }

          if (results[2].statusCode == 200) {
            final List<dynamic> vehicles = jsonDecode(results[2].body)['data'] ?? [];
            _totalVehicles = vehicles.length;
            _availableVehiclesCount = vehicles.where((v) => v['status'] == 'available').length;
            _inUseVehiclesCount = vehicles.where((v) => v['status'] == 'in_use').length;
            _maintenanceVehiclesCount = vehicles.where((v) => v['status'] == 'maintenance').length;
          }

          if (results[3].statusCode == 200) {
            final List<dynamic> history = jsonDecode(results[3].body)['data'] ?? [];
            _menungguPersetujuanCount = history.where((b) => b['status'] == 'pending_approval').length;
            _perluDitugaskanCount = history.where((b) => b['status'] == 'pending_assignment').length;
            _sedangBerjalanCount = history.where((b) => b['status'] == 'assigned' || b['status'] == 'on_going').length;
          }

          // Proses Notifikasi jika dikirimkan oleh backend
          if (results.length > 4 && results[4].statusCode == 200) {
            final List<dynamic> notifs = jsonDecode(results[4].body)['data'] ?? [];
            _unreadNotifCount = notifs.where((n) => n['is_read'] == false || n['is_read'] == 0).length;
          }

          _isLoadingData = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoadingData = false);
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

  void _goToRiwayatScreen() {
    Navigator.push(context, MaterialPageRoute(builder: (context) => const PengajuanScreen()));
  }

  void _openPlottingSheet(Map<String, dynamic> ticket) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return PlottingBottomSheet(
          ticket: ticket,
          availableVehicles: _availableVehicles,
          availableDrivers: _availableDrivers,
          token: _token,
          onSuccess: () {
            setState(() => _isLoadingData = true);
            _fetchDashboardData();
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgLight,
      body: RefreshIndicator(
        color: orangeBakrie,
        backgroundColor: Colors.white,
        onRefresh: _fetchDashboardData, 
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(), 
          child: Column( 
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: darkBlue,
                  borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(32), bottomRight: Radius.circular(32)),
                ),
                child: Stack(
                  children: [
                    Positioned.fill(
                      child: ClipRRect(
                        borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(32), bottomRight: Radius.circular(32)),
                        child: Image.asset(
                          'assets/images/car_header.png',
                          fit: BoxFit.cover, 
                          alignment: Alignment.centerRight, 
                          errorBuilder: (c, e, s) => const SizedBox(),
                        ),
                      ),
                    ),
                    Positioned.fill(
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(32), bottomRight: Radius.circular(32)),
                          gradient: LinearGradient(
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                            colors: [
                              darkBlue.withOpacity(1.0), 
                              darkBlue.withOpacity(0.8), 
                              darkBlue.withOpacity(0.0), 
                            ],
                            stops: const [0.0, 0.4, 1.0],
                          ),
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(top: 60, left: 24, right: 24, bottom: 40),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Image.asset(
                                'assets/images/logo_bakrie_white.png', 
                                height: 48, 
                                fit: BoxFit.contain, 
                                errorBuilder: (c,e,s) => const Text("BAKRIE ONE", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                              ),
                              GestureDetector(
                                onTap: () async {
                                  // Buka layar notifikasi dan tunggu hingga ia ditutup (untuk merefresh badge angka)
                                  final result = await Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (context) => const NotificationScreen()),
                                  );
                                  if (result == true) _fetchDashboardData();
                                }, 
                                child: Stack(
                                  clipBehavior: Clip.none,
                                  children: [
                                    const Icon(Icons.notifications_outlined, color: Colors.white, size: 28),
                                    if (_unreadNotifCount > 0)
                                      Positioned(
                                        right: -2, top: -2,
                                        child: Container(
                                          padding: const EdgeInsets.all(4),
                                          decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                                          child: Text(
                                            _unreadNotifCount > 99 ? '99+' : _unreadNotifCount.toString(), 
                                            style: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold)
                                          ),
                                        ),
                                      )
                                  ],
                                ),
                              )
                            ],
                          ),
                          const SizedBox(height: 35), 
                          const Text("Selamat pagi,", style: TextStyle(color: Colors.white70, fontSize: 14)),
                          const SizedBox(height: 4),
                          Text(_nama, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          const Text("Kepala Bagian Kendaraan", style: TextStyle(color: Colors.white70, fontSize: 13)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 1),
              Padding(
                padding: const EdgeInsets.all(24.0), 
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 12),
                      decoration: BoxDecoration(
                        color: Colors.white, 
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 15, offset: const Offset(0, 5))],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _buildStatItem(Icons.directions_car, _isLoadingData ? "-" : _totalVehicles.toString(), "Total\nKendaraan", const Color(0xFF3F51B5)), 
                          _buildStatItem(Icons.verified_user_rounded, _isLoadingData ? "-" : _availableVehiclesCount.toString(), "Tersedia", Colors.green),
                          _buildStatItem(Icons.autorenew, _isLoadingData ? "-" : _inUseVehiclesCount.toString(), "Digunakan", Colors.blue),
                          _buildStatItem(Icons.build, _isLoadingData ? "-" : _maintenanceVehiclesCount.toString(), "Maintenance", orangeBakrie),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20), 
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text("Permintaan Hari Ini", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: darkBlue)),
                        TextButton(
                          onPressed: _goToRiwayatScreen, 
                          child: const Text("Lihat Semua", style: TextStyle(fontSize: 12, color: Colors.blue))
                        ),
                      ],
                    ),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white, borderRadius: BorderRadius.circular(16),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))],
                      ),
                      child: Column(
                        children: [
                          _buildSummaryRow(Icons.access_time_filled, "Menunggu Persetujuan", _isLoadingData ? "-" : _menungguPersetujuanCount.toString(), orangeBakrie), 
                          const Divider(height: 1, thickness: 1, color: Color(0xFFF0F0F0)),
                          _buildSummaryRow(Icons.assignment_ind, "Perlu Ditugaskan", _isLoadingData ? "-" : _perluDitugaskanCount.toString(), Colors.blue),
                          const Divider(height: 1, thickness: 1, color: Color(0xFFF0F0F0)),
                          _buildSummaryRow(Icons.local_taxi, "Sedang Berjalan", _isLoadingData ? "-" : _sedangBerjalanCount.toString(), const Color(0xFF3F51B5)), 
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text("Pengajuan Terbaru", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: darkBlue)),
                        TextButton(
                          onPressed: _goToRiwayatScreen, 
                          child: const Text("Lihat Semua", style: TextStyle(fontSize: 12, color: Colors.blue))
                        ),
                      ],
                    ),
                    if (_isLoadingData)
                      const Center(child: Padding(padding: EdgeInsets.all(20.0), child: CircularProgressIndicator()))
                    else if (_pendingTickets.isEmpty)
                      const Center(child: Padding(padding: EdgeInsets.all(20.0), child: Text("Tidak ada pengajuan terbaru", style: TextStyle(color: Colors.grey))))
                    else
                      ..._pendingTickets.map((ticket) => _buildMockupTicketCard(ticket)),
                    const SizedBox(height: 10),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem(IconData icon, String count, String label, Color color) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.all(12), 
          decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)), 
          child: Icon(icon, color: color, size: 24),
        ),
        const SizedBox(height: 8),
        Text(count, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: darkBlue)),
        const SizedBox(height: 2),
        Text(label, textAlign: TextAlign.center, style: const TextStyle(fontSize: 10, color: Colors.grey)),
      ],
    );
  }

  Widget _buildSummaryRow(IconData icon, String title, String count, Color iconColor) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: _goToRiwayatScreen, 
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: iconColor.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                child: Icon(icon, color: iconColor, size: 20),
              ),
              const SizedBox(width: 16),
              Expanded(child: Text(title, style: TextStyle(fontWeight: FontWeight.w600, color: darkBlue, fontSize: 13))),
              Text(count, style: TextStyle(fontWeight: FontWeight.bold, color: darkBlue, fontSize: 16)),
              const SizedBox(width: 8),
              Icon(Icons.chevron_right, color: Colors.grey.shade400, size: 18), 
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMockupTicketCard(Map<String, dynamic> ticket) {
    final String deptName = ticket['Pemesan']?['Department']?['name'] ?? 'Departemen';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 15, offset: const Offset(0, 5))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const CircleAvatar(
                backgroundColor: Color(0xFFF0F4F8), 
                radius: 22,
                child: Icon(Icons.directions_car, color: Color(0xFF0D3B66)), 
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(ticket['Pemesan']?['name'] ?? 'Karyawan', style: TextStyle(fontWeight: FontWeight.bold, color: darkBlue, fontSize: 15)),
                    Text(deptName, style: const TextStyle(color: Colors.grey, fontSize: 12)), 
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: Colors.grey.shade400),
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
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => DetailPengajuanScreen(ticket: ticket),
                      ),
                    );
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: darkBlue, side: BorderSide(color: darkBlue),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text("Detail", style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed: () => _openPlottingSheet(ticket),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: orangeBakrie, foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    elevation: 0,
                  ),
                  child: const Text("Tugaskan", style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }
}