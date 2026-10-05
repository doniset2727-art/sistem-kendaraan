import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../utils/constants.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({super.key});

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  final Color darkBlue = const Color(0xFF0D3B66);
  final Color orangeBakrie = const Color(0xFFF37021);
  final Color bgLight = const Color(0xFFF8F9FA);

  bool _isLoading = true;
  List<dynamic> _notifications = [];
  String _token = "";
  String _userId = "";

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
  }

  Future<void> _fetchNotifications() async {
    try {
      const storage = FlutterSecureStorage();
      _token = await storage.read(key: 'token') ?? '';
      _userId = await storage.read(key: 'id') ?? '';

      if (_userId.isEmpty) {
        setState(() => _isLoading = false);
        return;
      }

      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/notifications/user/$_userId'),
        headers: {'Authorization': 'Bearer $_token', 'Accept': 'application/json'},
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (mounted) {
          setState(() {
            _notifications = data['data'] ?? [];
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

  // Fungsi untuk menandai notifikasi telah dibaca
  Future<void> _markAsRead(int notifId, int index) async {
    // Optimistic UI update: Langsung ubah warna di layar sebelum API selesai
    setState(() {
      _notifications[index]['is_read'] = true;
    });

    try {
      await http.put(
        Uri.parse('${AppConstants.baseUrl}/notifications/$notifId/read'),
        headers: {'Authorization': 'Bearer $_token', 'Accept': 'application/json'},
      );
    } catch (e) {
      // Jika API gagal, kembalikan warnanya
      setState(() {
        _notifications[index]['is_read'] = false;
      });
    }
  }

  String _formatTime(String? dateStr) {
    if (dateStr == null) return '-';
    try {
      final DateTime date = DateTime.parse(dateStr).toLocal();
      final Duration diff = DateTime.now().difference(date);
      
      if (diff.inMinutes < 1) return "Baru saja";
      if (diff.inMinutes < 60) return "${diff.inMinutes} menit yang lalu";
      if (diff.inHours < 24) return "${diff.inHours} jam yang lalu";
      if (diff.inDays < 7) return "${diff.inDays} hari yang lalu";
      return "${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}";
    } catch (e) {
      return dateStr;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgLight,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: darkBlue, size: 20),
          onPressed: () => Navigator.pop(context, true), // Kirim true agar Home auto-refresh saat kembali
        ),
        title: Text("Notifikasi", style: TextStyle(color: darkBlue, fontWeight: FontWeight.bold, fontSize: 16)),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: orangeBakrie))
          : _notifications.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.notifications_off_outlined, size: 60, color: Colors.grey.shade300),
                      const SizedBox(height: 16),
                      Text("Tidak ada notifikasi", style: TextStyle(color: Colors.grey.shade500)),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _fetchNotifications,
                  color: orangeBakrie,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(20),
                    itemCount: _notifications.length,
                    itemBuilder: (context, index) {
                      final notif = _notifications[index];
                      // Menyesuaikan penamaan kolom MySQL: is_read
                      final bool isRead = notif['is_read'] == true || notif['is_read'] == 1;
                      
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: isRead ? Colors.white : Colors.blue.shade50.withOpacity(0.4),
                          borderRadius: BorderRadius.circular(16),
                          border: isRead ? null : Border.all(color: Colors.blue.shade100, width: 1),
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 8, offset: const Offset(0, 2))],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            borderRadius: BorderRadius.circular(16),
                            onTap: () {
                              if (!isRead) _markAsRead(notif['id'], index);
                            },
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  CircleAvatar(
                                    radius: 20,
                                    backgroundColor: isRead ? Colors.grey.shade100 : orangeBakrie.withOpacity(0.1),
                                    child: Icon(Icons.notifications_active, color: isRead ? Colors.grey : orangeBakrie, size: 20),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(notif['title'] ?? '-', style: TextStyle(fontWeight: FontWeight.bold, color: darkBlue, fontSize: 14)),
                                        const SizedBox(height: 6),
                                        Text(notif['message'] ?? '-', style: const TextStyle(color: Colors.black87, fontSize: 12, height: 1.4)),
                                        const SizedBox(height: 10),
                                        Text(_formatTime(notif['created_at']), style: const TextStyle(color: Colors.grey, fontSize: 11)),
                                      ],
                                    ),
                                  ),
                                  if (!isRead)
                                    Container(
                                      width: 8, height: 8,
                                      margin: const EdgeInsets.only(top: 6),
                                      decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                                    )
                                ],
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}