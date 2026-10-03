import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/splash_screen.dart'; // Import Splash Screen kita

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PT Bakrie Autoparts',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.orange, // Tema bawaan diubah jadi Oranye
        fontFamily: GoogleFonts.poppins().fontFamily,
      ),
      home: const SplashScreen(), // <--- Aplikasi mulai dari sini sekarang
    );
  }
}