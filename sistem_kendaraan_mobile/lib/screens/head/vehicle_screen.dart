import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../utils/constants.dart'; 

class VehicleScreen extends StatefulWidget {
  const VehicleScreen({super.key});

  @override
  State<VehicleScreen> createState() => _VehicleScreenState();
}

class _VehicleScreenState extends State<VehicleScreen> {
  final Color darkBlue = const Color(0xFF0D3B66);
  final Color orangeBakrie = const Color(0xFFF37021);
  final Color bgLight = const Color(0xFFF8F9FA);

  int _selectedChipIndex = 0;
  final List<String> _filters = ["Semua", "Tersedia", "Digunakan", "Maintenance"];
  
  bool _isLoading = true;
  List<dynamic> _allVehicles = [];

  @override
  void initState() {
    super.initState();
    _fetchVehicles();
  }

  Future<void> _fetchVehicles() async {
    try {
      const storage = FlutterSecureStorage();
      String token = await storage.read(key: 'token') ?? '';

      // KUNCI PERUBAHAN: Memanggil AppConstants.baseUrl
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/vehicles'), 
        headers: {'Authorization': 'Bearer $token', 'Accept': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (mounted) {
          setState(() {
            _allVehicles = data['data'] ?? [];
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
    List<dynamic> displayedVehicles = _allVehicles;
    if (_selectedChipIndex == 1) displayedVehicles = _allVehicles.where((v) => v['status'] == 'available').toList();
    if (_selectedChipIndex == 2) displayedVehicles = _allVehicles.where((v) => v['status'] == 'in_use').toList();
    if (_selectedChipIndex == 3) displayedVehicles = _allVehicles.where((v) => v['status'] == 'maintenance').toList();

    return Scaffold(
      backgroundColor: bgLight,
      appBar: AppBar(
        backgroundColor: bgLight,
        elevation: 0,
        automaticallyImplyLeading: false, 
        title: Text("Kendaraan", style: TextStyle(color: darkBlue, fontWeight: FontWeight.bold)),
      ),
      body: Column(
        children: [
          // FILTER CHIPS
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
                hintText: "Cari plat nomor...",
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
              ? Center(child: CircularProgressIndicator(color: orangeBakrie))
              : displayedVehicles.isEmpty
                ? const Center(child: Text("Tidak ada kendaraan"))
                : RefreshIndicator(
                    onRefresh: _fetchVehicles,
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                      itemCount: displayedVehicles.length,
                      itemBuilder: (context, index) {
                        final v = displayedVehicles[index];
                        // Menyesuaikan status JSON (available, in_use, maintenance)
                        Color statusColor = v['status'] == 'available' ? Colors.green : (v['status'] == 'in_use' ? Colors.blue : orangeBakrie);
                        String displayStatus = v['status'] == 'available' ? 'Tersedia' : (v['status'] == 'in_use' ? 'Digunakan' : 'Maintenance');

                        return Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white, borderRadius: BorderRadius.circular(16),
                            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))],
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 70, height: 50,
                                decoration: BoxDecoration(color: const Color(0xFFF0F4F8), borderRadius: BorderRadius.circular(8)),
                                child: Icon(Icons.directions_car, color: darkBlue, size: 30),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(v['brand_model'] ?? '-', style: TextStyle(fontWeight: FontWeight.bold, color: darkBlue, fontSize: 14)),
                                    Text(v['license_plate'] ?? '-', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        Icon(Icons.radio_button_checked, size: 14, color: statusColor),
                                        const SizedBox(width: 4),
                                        Text(displayStatus, style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
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