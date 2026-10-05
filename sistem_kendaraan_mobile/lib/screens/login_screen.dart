import 'package:flutter/material.dart';
import '../services/auth_api/auth_service.dart';
import '../navigation/head_navigation.dart'; 
import 'driver/driver_dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _nipController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscureText = true;

  final Color darkBlue = const Color(0xFF0D3B66);
  final Color orangeBakrie = const Color(0xFFF37021);

  void _showTopNotification(String message, Color color) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(color == Colors.red.shade700 ? Icons.error_outline : Icons.check_circle_outline, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(child: Text(message, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
          ],
        ),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        margin: EdgeInsets.only(bottom: MediaQuery.of(context).size.height - 140, left: 24, right: 24),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  Future<void> _login() async {
    final nip = _nipController.text.trim();
    final password = _passwordController.text.trim();

    if (nip.isEmpty || password.isEmpty) {
      _showTopNotification("NIP dan Password wajib diisi!", Colors.red.shade700);
      return;
    }

    setState(() => _isLoading = true);
    // AuthService sekarang sudah mengurus penyimpanan SharedPreferences
    final result = await AuthService.login(nip, password);
    setState(() => _isLoading = false);

    if (result['success'] == true) {
      _showTopNotification("Login Berhasil!", Colors.green.shade700);
      Future.delayed(const Duration(milliseconds: 500), () {
        if (!context.mounted) return;
        final role = result['role'];
        if (role == 'kepala_bagian' || role == 'head_of_vehicle') {
          Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (context) => const HeadNavigation()));
        } else if (role == 'supir' || role == 'driver') {
          Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (context) => const DriverDashboardScreen()));
        } else {
          Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (context) => const HeadNavigation()));
        }
      });
    } else {
      _showTopNotification(result['message'] ?? 'Login Gagal', Colors.red.shade700);
    }
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: darkBlue, 
      body: Stack(
        children: [
          Positioned.fill(
            child: Image.asset(
              'assets/images/bg_login.png', 
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => Container(color: const Color(0xFF0F2C59)),
            ),
          ),
          
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomLeft, end: Alignment.topRight,
                  colors: [darkBlue.withOpacity(0.95), darkBlue.withOpacity(0.2)],
                ),
              ),
            ),
          ),

          Positioned(
            left: 16,
            top: 60,
            bottom: 40,
            width: size.width * 0.35, 
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Image.asset(
                      'assets/images/logo_bakrie_white.png', 
                      height: 40, 
                      errorBuilder: (context, error, stackTrace) => Icon(Icons.directions_car, color: orangeBakrie, size: 40),
                    ),
                    const SizedBox(height: 8),
                    const Text("PT. Bakrie Autoparts", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                    const Text("DRIVING A BETTER TOMORROW", style: TextStyle(color: Colors.white70, fontSize: 6, letterSpacing: 0.5)),
                  ],
                ),
                
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("Together\nWe Drive\nProgress", style: TextStyle(color: Colors.white, fontSize: 20, fontStyle: FontStyle.italic, fontWeight: FontWeight.bold, height: 1.2)),
                    const SizedBox(height: 12),
                    Container(height: 3, width: 30, color: orangeBakrie),
                    const SizedBox(height: 12),
                    const Text("Satu aplikasi untuk\nmendukung setiap\nlangkah anda di\nPT. Bakrie Autoparts.", style: TextStyle(color: Colors.white70, fontSize: 10, height: 1.4)),
                  ],
                ),
              ],
            ),
          ),

          Align(
            alignment: Alignment.centerRight,
            child: Container(
              width: size.width * 0.63, 
              height: size.height,
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(topLeft: Radius.circular(40), bottomLeft: Radius.circular(40)),
                boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 30, offset: Offset(-10, 0))],
              ),
              child: ClipRRect(
                borderRadius: const BorderRadius.only(topLeft: Radius.circular(40), bottomLeft: Radius.circular(40)),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 60),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Column(
                          children: [
                            Image.asset(
                              'assets/images/logo_bakrie_one.png', 
                              height: 60, 
                              errorBuilder: (context, error, stackTrace) => Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(color: darkBlue, borderRadius: BorderRadius.circular(16)),
                                child: const Icon(Icons.directions_car, size: 40, color: Colors.white),
                              ),
                            ),
                            const SizedBox(height: 12),
                            const Text("Employee Digital Platform", style: TextStyle(fontSize: 9, color: Colors.grey)),
                          ],
                        ),
                      ),
                      
                      const SizedBox(height: 60),

                      Text("Selamat Datang", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: darkBlue)),
                      const SizedBox(height: 6),
                      const Text("Silakan masuk untuk melanjutkan", style: TextStyle(color: Colors.grey, fontSize: 11)),
                      const SizedBox(height: 24),

                      TextField(
                        controller: _nipController,
                        keyboardType: TextInputType.number,
                        style: const TextStyle(fontSize: 14),
                        decoration: InputDecoration(
                          hintText: "NIP",
                          prefixIcon: Icon(Icons.person_outline, color: darkBlue, size: 20),
                          contentPadding: const EdgeInsets.symmetric(vertical: 16),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade300)),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade300)),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: darkBlue, width: 2)),
                        ),
                      ),
                      const SizedBox(height: 16),

                      TextField(
                        controller: _passwordController,
                        obscureText: _obscureText,
                        style: const TextStyle(fontSize: 14),
                        decoration: InputDecoration(
                          hintText: "Password",
                          prefixIcon: Icon(Icons.lock_outline, color: darkBlue, size: 20),
                          suffixIcon: IconButton(
                            icon: Icon(_obscureText ? Icons.visibility_off_outlined : Icons.visibility_outlined, color: Colors.grey, size: 20),
                            onPressed: () => setState(() => _obscureText = !_obscureText),
                          ),
                          contentPadding: const EdgeInsets.symmetric(vertical: 16),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade300)),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade300)),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: darkBlue, width: 2)),
                        ),
                      ),
                      const SizedBox(height: 8),

                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: () {},
                          style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(50, 30), tapTargetSize: MaterialTapTargetSize.shrinkWrap),
                          child: Text("Lupa Password?", style: TextStyle(color: darkBlue, fontWeight: FontWeight.w600, fontSize: 12)),
                        ),
                      ),
                      const SizedBox(height: 24),

                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _login,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: darkBlue,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            elevation: 0,
                          ),
                          child: _isLoading
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                              : const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text("Masuk", style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                                    SizedBox(width: 8),
                                    Icon(Icons.arrow_forward, size: 18),
                                  ],
                                ),
                        ),
                      ),
                      
                      const SizedBox(height: 50),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          Expanded(child: _buildFooterIcon(Icons.fingerprint, "Akses\nMudah")),
                          Expanded(child: _buildFooterIcon(Icons.verified_user_outlined, "Aman &\nTerpercaya")),
                          Expanded(child: _buildFooterIcon(Icons.phone_android, "Kapan Saja\nDim. Saja")),
                          Expanded(child: _buildFooterIcon(Icons.share, "Untuk\nBersama")),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          
          Positioned(
            bottom: -30,
            right: -30,
            child: Container(
              width: 100, height: 100,
              decoration: BoxDecoration(color: orangeBakrie, shape: BoxShape.circle),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFooterIcon(IconData icon, String label) {
    return Column(
      children: [
        Icon(icon, color: Colors.grey.shade400, size: 24),
        const SizedBox(height: 6),
        Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 8, color: Colors.grey.shade600, height: 1.2),
        ),
      ],
    );
  }
}