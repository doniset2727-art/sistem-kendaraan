import 'package:flutter/material.dart';

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

  final List<Map<String, dynamic>> _drivers = [
    {"name": "Andi Setiawan", "phone": "0812 1111 2222", "status": "Tersedia"},
    {"name": "Budi Santoso", "phone": "0812 2222 3333", "status": "Tersedia"},
    {"name": "Rudi Hartono", "phone": "0812 3333 4444", "status": "Bertugas"},
    {"name": "Agus Setiawan", "phone": "0812 4444 5555", "status": "Tersedia"},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgLight,
      appBar: AppBar(
        backgroundColor: bgLight,
        elevation: 0,
        // KUNCI PERBAIKAN: Tombol leading dibuang dan diganti automaticallyImplyLeading: false
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
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              itemCount: _drivers.length,
              itemBuilder: (context, index) {
                final d = _drivers[index];
                Color statusColor = d['status'] == 'Tersedia' ? Colors.green : Colors.blue;
                
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
                            Text(d['name'], style: TextStyle(fontWeight: FontWeight.bold, color: darkBlue, fontSize: 14)),
                            Text(d['phone'], style: const TextStyle(color: Colors.grey, fontSize: 12)),
                          ],
                        ),
                      ),
                      Text(d['status'], style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.bold)),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}