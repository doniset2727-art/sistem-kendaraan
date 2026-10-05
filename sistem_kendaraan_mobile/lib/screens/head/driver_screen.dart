import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../utils/constants.dart';
class DriverScreen extends StatefulWidget {
  const DriverScreen({super.key});

  @override
  State<DriverScreen> createState() => _DriverScreenState();
}

class _DriverScreenState extends State<DriverScreen> {
  final Color darkBlue = const Color(0xFF0D3B66);
  final Color bgLight = const Color(0xFFF8F9FA);

  int _selectedChipIndex = 0;
  final List<String> _filters = ["Semua", "Tersedia", "Bertugas"];

  bool _isLoading = true;
  List<dynamic> _allDrivers = [];

  @override
  void initState() {
    super.initState();
    _fetchDrivers();
  }

  Future<void> _fetchDrivers() async {
    try {
      const storage = FlutterSecureStorage();
      String token = await storage.read(key: 'token') ?? '';

      // KUNCI PERUBAHAN: Memanggil AppConstants.baseUrl
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/drivers'),
        headers: {'Authorization': 'Bearer $token', 'Accept': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (mounted) {
          setState(() {
            _allDrivers = data['data'] ?? [];
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

  @override
  Widget build(BuildContext context) {
    // Logika Filter
    List<dynamic> displayedDrivers = _allDrivers;
    if (_selectedChipIndex == 1) displayedDrivers = _allDrivers.where((d) => d['status'] == 'available').toList();
    if (_selectedChipIndex == 2) displayedDrivers = _allDrivers.where((d) => d['status'] == 'on_duty').toList();

    return Scaffold(
      backgroundColor: bgLight,
      appBar: AppBar(
        backgroundColor: bgLight,
        elevation: 0,
        automaticallyImplyLeading: false, 
        title: Text("Daftar Driver", style: TextStyle(color: darkBlue, fontWeight: FontWeight.bold)),
      ),
      body: Column(
        children: [
          SizedBox(
            height: 60,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: _filters.length,
              itemBuilder: (context, index) {
                bool isSelected = _selectedChipIndex == index;
                return Padding(
                  padding: const EdgeInsets.only(right: 12),
                  child: FilterChip(
                    label: Text(_filters[index]),
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : Colors.grey.shade600,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                    backgroundColor: Colors.white,
                    selectedColor: darkBlue,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: isSelected ? darkBlue : Colors.grey.shade300)),
                    selected: isSelected,
                    onSelected: (bool selected) => setState(() => _selectedChipIndex = index),
                  ),
                );
              },
            ),
          ),
          
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: TextField(
              decoration: InputDecoration(
                hintText: "Cari driver...",
                prefixIcon: const Icon(Icons.search, color: Colors.grey),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
          ),

          Expanded(
            child: _isLoading 
              ? Center(child: CircularProgressIndicator(color: darkBlue))
              : displayedDrivers.isEmpty
                ? const Center(child: Text("Tidak ada supir ditemukan"))
                : RefreshIndicator(
                    onRefresh: _fetchDrivers,
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                      itemCount: displayedDrivers.length,
                      itemBuilder: (context, index) {
                        final d = displayedDrivers[index];
                        final user = d['User'] ?? {}; // Join dari tabel User
                        Color statusColor = d['status'] == 'available' ? Colors.green : Colors.blue;
                        String displayStatus = d['status'] == 'available' ? 'Tersedia' : 'Bertugas';
                        
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white, borderRadius: BorderRadius.circular(16),
                            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))],
                          ),
                          child: Row(
                            children: [
                              const CircleAvatar(
                                radius: 24, backgroundColor: Color(0xFFF0F4F8),
                                child: Icon(Icons.person, color: Color(0xFF0D3B66)),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(user['name'] ?? 'Driver', style: TextStyle(fontWeight: FontWeight.bold, color: darkBlue, fontSize: 14)),
                                    Text(user['nip'] ?? d['sim_number'] ?? '-', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                  ],
                                ),
                              ),
                              Text(displayStatus, style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}