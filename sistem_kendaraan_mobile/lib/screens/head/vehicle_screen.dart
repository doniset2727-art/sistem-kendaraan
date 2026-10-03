import 'package:flutter/material.dart';

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

  final List<Map<String, dynamic>> _vehicles = [
    {"name": "Toyota Innova", "plat": "B 1234 ABC", "status": "Tersedia", "image": "assets/images/car_header.png"},
    {"name": "Toyota Fortuner", "plat": "B 5678 DEF", "status": "Digunakan", "driver": "Andi Setiawan", "tujuan": "Jakarta", "image": "assets/images/car_header.png"},
    {"name": "Toyota Hiace", "plat": "B 9012 GHI", "status": "Maintenance", "image": "assets/images/car_header.png"},
    {"name": "Toyota Avanza", "plat": "B 3456 JKL", "status": "Tersedia", "image": "assets/images/car_header.png"},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgLight,
      appBar: AppBar(
        backgroundColor: bgLight,
        elevation: 0,
        automaticallyImplyLeading: false, 
        title: Text("Kendaraan", style: TextStyle(color: darkBlue, fontWeight: FontWeight.bold)),
        actions: [IconButton(icon: Icon(Icons.filter_list, color: darkBlue), onPressed: () {})],
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
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                      side: BorderSide(color: isSelected ? darkBlue : Colors.grey.shade300),
                    ),
                    selected: isSelected,
                    onSelected: (bool selected) {
                      setState(() => _selectedChipIndex = index);
                    },
                  ),
                );
              },
            ),
          ),
          
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: TextField(
              decoration: InputDecoration(
                hintText: "Cari kendaraan...",
                prefixIcon: const Icon(Icons.search, color: Colors.grey),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
          ),

          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              itemCount: _vehicles.length,
              itemBuilder: (context, index) {
                final v = _vehicles[index];
                Color statusColor = v['status'] == 'Tersedia' ? Colors.green : (v['status'] == 'Digunakan' ? Colors.blue : orangeBakrie);
                
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
                        child: Image.asset(v['image'], fit: BoxFit.contain, errorBuilder: (c,e,s) => Icon(Icons.directions_car, color: darkBlue)),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(v['name'], style: TextStyle(fontWeight: FontWeight.bold, color: darkBlue, fontSize: 14)),
                            Text(v['plat'], style: const TextStyle(color: Colors.grey, fontSize: 12)),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Icon(Icons.radio_button_checked, size: 14, color: statusColor),
                                const SizedBox(width: 4),
                                Text(v['status'], style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.bold)),
                              ],
                            ),
                            if (v['status'] == 'Digunakan') ...[
                              const SizedBox(height: 4),
                              Text("Driver: ${v['driver']}\nTujuan: ${v['tujuan']}", style: TextStyle(color: Colors.grey.shade600, fontSize: 10)),
                            ]
                          ],
                        ),
                      ),
                      Icon(Icons.chevron_right, color: Colors.grey.shade400),
                    ],
                  ),
                );
              },
            ),
          ),
          
          Padding(
            padding: const EdgeInsets.all(20),
            child: SizedBox(
              width: double.infinity, height: 50,
              child: ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.add),
                label: const Text("Tambah Pemesanan", style: TextStyle(fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: orangeBakrie, foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          )
        ],
      ),
    );
  }
}