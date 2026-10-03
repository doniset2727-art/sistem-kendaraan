import 'package:flutter/material.dart';
import 'dart:async';
import 'login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    // Animasi muncul perlahan (Fade In)
    _animationController = AnimationController(vsync: this, duration: const Duration(seconds: 2));
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(_animationController);
    _animationController.forward();

    // Pindah ke Login Screen setelah 3 detik
    Timer(const Duration(seconds: 3), () {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Gambar Logo Asli yang sudah disesuaikan ukurannya
              Image.asset(
                'assets/images/logo_bakrie_one.png', 
                height: 120, // Menggunakan height agar proporsional
                errorBuilder: (context, error, stackTrace) => const Icon(Icons.directions_car, size: 80, color: Color(0xFF0D3B66)),
              ),
              
              const SizedBox(height: 26), // Jarak antara logo dan teks
              
              const Text(
                "Employee Digital Platform",
                style: TextStyle(
                  fontSize: 14, 
                  color: Colors.grey, 
                  letterSpacing: 1
                ),
              ),
              
              const SizedBox(height: 50),
              
              // Loading Oranye Bakrie
              const CircularProgressIndicator(color: Color(0xFFF37021)),
            ],
          ),
        ),
      ),
    );
  }
}