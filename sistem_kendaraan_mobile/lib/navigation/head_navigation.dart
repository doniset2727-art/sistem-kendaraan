import 'package:flutter/material.dart';
import '../screens/head/head_dashboard_screen.dart'; 
import '../screens/head/vehicle_screen.dart';        
import '../screens/head/driver_screen.dart'; 
import '../screens/head/pengajuan_screen.dart';
import '../screens/head/profil_screen.dart';        

class HeadNavigation extends StatefulWidget {
  const HeadNavigation({super.key});

  @override
  State<HeadNavigation> createState() => _HeadNavigationState();
}

class _HeadNavigationState extends State<HeadNavigation> {
  int _selectedIndex = 0;
  final Color orangeBakrie = const Color(0xFFF37021);

  // Daftar halaman anak (Tanpa navigasi bawah di dalamnya)
  final List<Widget> _pages = [
    const HeadDashboardScreen(),
    const VehicleScreen(),
    const PengajuanScreen(),
    const DriverScreen(),
    const ProfilScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_selectedIndex], 
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))]
        ),
        child: BottomNavigationBar(
          currentIndex: _selectedIndex,
          onTap: (index) => setState(() => _selectedIndex = index),
          backgroundColor: Colors.white,
          selectedItemColor: orangeBakrie,
          unselectedItemColor: Colors.grey.shade400,
          showUnselectedLabels: true,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
          unselectedLabelStyle: const TextStyle(fontSize: 10),
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.home_filled), label: "Home"),
            BottomNavigationBarItem(icon: Icon(Icons.directions_car_outlined), label: "Kendaraan"),
            BottomNavigationBarItem(icon: Icon(Icons.assignment_outlined), label: "Pengajuan"),
            BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: "Driver"),
            BottomNavigationBarItem(icon: Icon(Icons.account_circle_outlined), label: "Profil"),
          ],
        ),
      ),
    );
  }
}