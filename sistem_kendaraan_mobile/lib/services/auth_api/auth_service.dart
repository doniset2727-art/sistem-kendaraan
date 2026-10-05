import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../utils/constants.dart';

class AuthService {
  // Membuat instansi brankas besi (Secure Storage)
  static const _storage = FlutterSecureStorage();

  static Future<Map<String, dynamic>> login(String nip, String password) async {
    try {
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

      if (response.statusCode == 200) {
        final responseBody = jsonDecode(response.body);
        final userData = responseBody['data']; 
        
        // KUNCI PERBAIKAN: Menyimpan data ke dalam brankas enkripsi (Secure Storage)
        await _storage.write(key: 'token', value: userData['token'] ?? '');
        await _storage.write(key: 'role', value: userData['role'] ?? ''); 
        await _storage.write(key: 'nip', value: nip);
        await _storage.write(key: 'nama', value: userData['name'] ?? 'Pengguna'); 
        await _storage.write(key: 'id', value: userData['id'].toString()); 

        return {
          'success': true, 
          'message': 'Login berhasil',
          'role': userData['role'], 
        };
      } else {
        final data = jsonDecode(response.body);
        return {
          'success': false, 
          'message': data['message'] ?? 'Gagal login, periksa kembali NIP dan Password.'
        };
      }
    } catch (e) {
      return {
        'success': false, 
        'message': 'Tidak dapat terhubung ke server. Pastikan Backend menyala.'
      };
    }
  }

  // Fungsi tambahan untuk membersihkan brankas saat Logout
  static Future<void> logout() async {
    await _storage.deleteAll();
  }
}