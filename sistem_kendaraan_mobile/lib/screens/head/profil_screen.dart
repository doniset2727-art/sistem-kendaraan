import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../services/auth_api/auth_service.dart';
import '../login_screen.dart';

class ProfilScreen extends StatefulWidget {
  const ProfilScreen({super.key});

  @override
  State<ProfilScreen> createState() => _ProfilScreenState();
}

class _ProfilScreenState extends State<ProfilScreen> {
  String _nama = "Memuat...";
  String _nip = "-";
  String _role = "-";

  final Color darkBlue = const Color(0xFF0D3B66);
  final Color orangeBakrie = const Color(0xFFF37021);
  final Color bgLight = const Color(0xFFF8F9FA);

  @override
  void initState() {
    super.initState();
    _loadProfileData();
  }

  // Mengambil data pengguna dari brankas Secure Storage
  Future<void> _loadProfileData() async {
    const storage = FlutterSecureStorage();
    final nama = await storage.read(key: 'nama');
    final nip = await storage.read(key: 'nip');
    final role = await storage.read(key: 'role');

    setState(() {
      _nama = nama ?? 'Karyawan';
      _nip = nip ?? '-';
      
      // Merapikan teks role
      if (role == 'kepala_bagian' || role == 'head_of_vehicle') {
        _role = 'Kepala Bagian Kendaraan';
      } else if (role == 'supir' || role == 'driver') {
        _role = 'Supir / Driver';
      } else {
        _role = role ?? 'Staff';
      }
    });
  }

  // Fungsi Logout yang memanggil AuthService pembersih brankas
  Future<void> _logout() async {
    // Tampilkan dialog konfirmasi
    final bool confirm = await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text("Konfirmasi Keluar", style: TextStyle(color: darkBlue, fontWeight: FontWeight.bold)),
        content: const Text("Apakah Anda yakin ingin keluar dari akun ini?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text("Batal", style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red.shade600,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text("Keluar", style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    ) ?? false;

    if (confirm) {
      if (!mounted) return;
      
      // Hapus data dari Secure Storage
      await AuthService.logout();
      
      // Lempar kembali ke halaman Login
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgLight,
      appBar: AppBar(
        backgroundColor: bgLight,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: Text("Profil Saya", style: TextStyle(color: darkBlue, fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // HEADER PROFIL
            Center(
              child: Column(
                children: [
                  Container(
                    width: 100, height: 100,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 15, offset: const Offset(0, 5))],
                      border: Border.all(color: orangeBakrie.withOpacity(0.5), width: 3),
                    ),
                    child: Center(
                      child: Text(
                        _nama[0].toUpperCase(), 
                        style: TextStyle(fontSize: 40, fontWeight: FontWeight.bold, color: darkBlue),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(_nama, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: darkBlue)),
                  const SizedBox(height: 4),
                  Text(_role, style: TextStyle(fontSize: 14, color: orangeBakrie, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Text("NIP: $_nip", style: const TextStyle(fontSize: 13, color: Colors.grey)),
                ],
              ),
            ),
            
            const SizedBox(height: 40),

            // MENU PENGATURAN UMUM
            Align(
              alignment: Alignment.centerLeft,
              child: Text("Pengaturan Akun", style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey.shade600)),
            ),
            const SizedBox(height: 12),
            _buildMenuOption(Icons.person_outline, "Edit Profil", () {}),
            _buildMenuOption(Icons.lock_outline, "Ubah Password", () {}),
            _buildMenuOption(Icons.history, "Log Aktivitas", () {}),

            const SizedBox(height: 24),

            // MENU BANTUAN
            Align(
              alignment: Alignment.centerLeft,
              child: Text("Lainnya", style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey.shade600)),
            ),
            const SizedBox(height: 12),
            _buildMenuOption(Icons.help_outline, "Pusat Bantuan", () {}),
            _buildMenuOption(Icons.info_outline, "Tentang Aplikasi", () {}),

            const SizedBox(height: 32),

            // TOMBOL LOGOUT UTAMA
            SizedBox(
              width: double.infinity,
              height: 50,
              child: OutlinedButton.icon(
                onPressed: _logout,
                icon: const Icon(Icons.logout),
                label: const Text("Keluar Akun", style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.red.shade600,
                  side: BorderSide(color: Colors.red.shade200, width: 2),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  backgroundColor: Colors.white,
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text("Versi 1.0.0", style: TextStyle(color: Colors.grey, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  // Desain menu menggunakan Material agar efek klik (ripple) terlihat jelas
  Widget _buildMenuOption(IconData icon, String title, VoidCallback onTap) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: onTap,
          child: ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFF0F4F8), 
                borderRadius: BorderRadius.circular(8)
              ),
              child: Icon(icon, color: darkBlue, size: 20),
            ),
            title: Text(title, style: TextStyle(color: darkBlue, fontWeight: FontWeight.w600, fontSize: 14)),
            trailing: Icon(Icons.chevron_right, color: Colors.grey.shade400),
          ),
        ),
      ),
    );
  }
}