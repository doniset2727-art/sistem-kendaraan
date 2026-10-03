import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../utils/constants.dart';

class AuthService {
  // Fungsi utama untuk nembak API Login ke Node.js
  static Future<Map<String, dynamic>> login(String nip, String password) async {
    try {
      // Endpoint yang benar mengarah ke rute /users/login
      final url = Uri.parse('${AppConstants.baseUrl}/users/login'); 
      
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({
          'nip': nip,
          'password': password,
        }),
      );

      // Jika Backend membalas dengan status 200 (OK/Sukses)
      if (response.statusCode == 200) {
        final responseBody = jsonDecode(response.body);
        
        // KUNCI PERBAIKAN: Kita buka dulu bungkus 'data' dari Node.js
        final userData = responseBody['data']; 
        
        // Membuka brankas penyimpanan memori HP (Shared Preferences)
        SharedPreferences prefs = await SharedPreferences.getInstance();
        
        // Simpan data penting ke HP menggunakan userData
        await prefs.setString('token', userData['token'] ?? '');
        await prefs.setString('role', userData['role'] ?? ''); 
        await prefs.setString('nip', nip);
        await prefs.setString('nama', userData['name'] ?? 'Pengguna'); // Node.js mengirimkan key 'name'

        return {
          'success': true, 
          'message': 'Login berhasil',
          'role': userData['role'], // Role dikirim dengan bersih untuk diproses login_screen
        };
      } else {
        // Jika gagal (NIP salah, password salah, dll)
        final data = jsonDecode(response.body);
        return {
          'success': false, 
          'message': data['message'] ?? 'Gagal login, periksa kembali NIP dan Password.'
        };
      }
    } catch (e) {
      // Jika server Node.js mati atau tidak ada koneksi internet
      return {
        'success': false, 
        'message': 'Tidak dapat terhubung ke server. Pastikan Backend menyala.'
      };
    }
  }
}