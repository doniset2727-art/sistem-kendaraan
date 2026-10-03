import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import '../../utils/constants.dart';
import '../login_screen.dart';
import '../../widgets/plotting_bottom_sheet.dart'; 

class HeadDashboardScreen extends StatefulWidget {
  const HeadDashboardScreen({super.key});

  @override
  State<HeadDashboardScreen> createState() => _HeadDashboardScreenState();
}

class _HeadDashboardScreenState extends State<HeadDashboardScreen> {
  String _nama = "Memuat...";
  String _token = "";
  
  bool _isLoadingData = true;
  List<dynamic> _pendingTickets = [];
  List<dynamic> _availableVehicles = [];
  List<dynamic> _availableDrivers = [];

  final Color darkBlue = const Color(0xFF0D3B66);
  final Color orangeBakrie = const Color(0xFFF37021);
  final Color bgLight = const Color(0xFFF8F9FA);

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      _nama = prefs.getString('nama') ?? 'Kepala Bagian';
      _token = prefs.getString('token') ?? '';
    });
    
    if (_token.isNotEmpty) {
      _fetchDashboardData();
    } else {
      setState(() => _isLoadingData = false);
    }
  }

  Future<void> _fetchDashboardData() async {
    try {
      final ticketRes = await http.get(
        Uri.parse('${AppConstants.baseUrl}/bookings/pool/pending-assignments'),
        headers: {'Authorization': 'Bearer $_token', 'Accept': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      final masterRes = await http.get(
        Uri.parse('${AppConstants.baseUrl}/bookings/pool/master-data'),
        headers: {'Authorization': 'Bearer $_token', 'Accept': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      if (ticketRes.statusCode == 200 && masterRes.statusCode == 200) {
        final ticketData = jsonDecode(ticketRes.body)['data'];
        final masterData = jsonDecode(masterRes.body)['data'];

        if (mounted) {
          setState(() {
            _pendingTickets = ticketData ?? []; 
            _availableVehicles = masterData?['vehicles'] ?? [];
            _availableDrivers = masterData?['drivers'] ?? [];
            _isLoadingData = false;
          });
        }
      } else {
        if (mounted) setState(() => _isLoadingData = false);
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

  Future<void> _logout() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (context) => const LoginScreen()));
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
                                onTap: _logout, 
                                child: Stack(
                                  clipBehavior: Clip.none,
                                  children: [
                                    const Icon(Icons.notifications_outlined, color: Colors.white, size: 28),
                                    Positioned(
                                      right: -2, top: -2,
                                      child: Container(
                                        padding: const EdgeInsets.all(4),
                                        decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                                        child: const Text('3', style: TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold)),
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
                          _buildStatItem(Icons.directions_car, "12", "Total\nKendaraan", const Color(0xFF3F51B5)), 
                          _buildStatItem(Icons.verified_user_rounded, _isLoadingData ? "-" : _availableVehicles.length.toString(), "Tersedia", Colors.green),
                          _buildStatItem(Icons.autorenew, "3", "Digunakan", Colors.blue),
                          _buildStatItem(Icons.build, "1", "Maintenance", orangeBakrie),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20), 
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text("Permintaan Hari Ini", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: darkBlue)),
                        TextButton(onPressed: (){}, child: const Text("Lihat Semua", style: TextStyle(fontSize: 12, color: Colors.blue))),
                      ],
                    ),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white, borderRadius: BorderRadius.circular(16),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))],
                      ),
                      child: Column(
                        children: [
                          _buildSummaryRow(Icons.access_time_filled, "Menunggu Persetujuan", "5", orangeBakrie), 
                          const Divider(height: 1, thickness: 1, color: Color(0xFFF0F0F0)),
                          _buildSummaryRow(Icons.assignment_ind, "Perlu Ditugaskan", _isLoadingData ? "-" : _pendingTickets.length.toString(), Colors.blue),
                          const Divider(height: 1, thickness: 1, color: Color(0xFFF0F0F0)),
                          _buildSummaryRow(Icons.local_taxi, "Sedang Berjalan", "4", const Color(0xFF3F51B5)), 
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text("Pengajuan Terbaru", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: darkBlue)),
                        TextButton(onPressed: (){}, child: const Text("Lihat Semua", style: TextStyle(fontSize: 12, color: Colors.blue))),
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
    return Padding(
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
        ],
      ),
    );
  }

  Widget _buildMockupTicketCard(Map<String, dynamic> ticket) {
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
                    const Text("Produksi", style: TextStyle(color: Colors.grey, fontSize: 12)), 
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
                  onPressed: () {},
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