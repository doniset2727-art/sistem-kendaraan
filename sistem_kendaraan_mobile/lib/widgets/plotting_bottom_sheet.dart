import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../utils/constants.dart';

class PlottingBottomSheet extends StatefulWidget {
  final Map<String, dynamic> ticket;
  final List<dynamic> availableVehicles;
  final List<dynamic> availableDrivers;
  final String token;
  final VoidCallback onSuccess;

  const PlottingBottomSheet({
    super.key,
    required this.ticket,
    required this.availableVehicles,
    required this.availableDrivers,
    required this.token,
    required this.onSuccess,
  });

  @override
  State<PlottingBottomSheet> createState() => _PlottingBottomSheetState();
}

class _PlottingBottomSheetState extends State<PlottingBottomSheet> {
  String? selectedVehicleId;
  String? selectedDriverId;
  bool isSubmitting = false;

  Future<void> _assignTicket() async {
    setState(() => isSubmitting = true);

    try {
      // Memastikan ID tiket terbaca dengan aman
      final String ticketId = widget.ticket['id'].toString();
      final url = Uri.parse('${AppConstants.baseUrl}/bookings/$ticketId/assign');
      
      final response = await http.post(
        url,
        headers: {
          'Authorization': 'Bearer ${widget.token}',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({
          'vehicle_id': int.parse(selectedVehicleId!),
          'driver_id': int.parse(selectedDriverId!),
        }),
      );

      final result = jsonDecode(response.body);

      if (response.statusCode == 200) {
        if (!mounted) return;
        Navigator.pop(context); 
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['message'] ?? 'Penugasan berhasil!'), backgroundColor: Colors.green),
        );
        
        // Memicu Auto-Refresh di halaman Home
        widget.onSuccess(); 
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['message'] ?? 'Gagal menugaskan tiket!'), backgroundColor: Colors.red),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Terjadi kesalahan koneksi server!'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) {
        setState(() => isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Mengecek ketersediaan data untuk mengunci dropdown jika kosong
    final bool hasVehicles = widget.availableVehicles.isNotEmpty;
    final bool hasDrivers = widget.availableDrivers.isNotEmpty;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 50, height: 5, 
              decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(10))
            )
          ),
          const SizedBox(height: 24),
          const Text("Plotting Penugasan", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(
            "Tiket: ${widget.ticket['booking_code'] ?? '-'} | ${widget.ticket['Pemesan']?['name'] ?? 'Karyawan'}", 
            style: TextStyle(color: Colors.grey.shade600)
          ),
          const SizedBox(height: 24),

          // DROPDOWN MOBIL
          const Text("Pilih Mobil", style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            decoration: InputDecoration(
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              filled: !hasVehicles,
              fillColor: Colors.grey.shade100,
            ),
            hint: Text(hasVehicles ? "Pilih Mobil Tersedia" : "Tidak ada mobil tersedia"),
            value: selectedVehicleId,
            items: hasVehicles ? widget.availableVehicles.map((vehicle) {
              return DropdownMenuItem<String>(
                value: vehicle['id'].toString(),
                child: Text("${vehicle['brand_model']} (${vehicle['license_plate']})"),
              );
            }).toList() : null,
            onChanged: hasVehicles ? (val) => setState(() => selectedVehicleId = val) : null,
          ),
          const SizedBox(height: 20),

          // DROPDOWN SUPIR
          const Text("Pilih Supir", style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            decoration: InputDecoration(
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              filled: !hasDrivers,
              fillColor: Colors.grey.shade100,
            ),
            hint: Text(hasDrivers ? "Pilih Supir Standby" : "Tidak ada supir standby"),
            value: selectedDriverId,
            items: hasDrivers ? widget.availableDrivers.map((driver) {
              return DropdownMenuItem<String>(
                value: driver['id'].toString(),
                child: Text(driver['User']?['name'] ?? 'Tanpa Nama'), 
              );
            }).toList() : null,
            onChanged: hasDrivers ? (val) => setState(() => selectedDriverId = val) : null,
          ),
          const SizedBox(height: 32),

          // TOMBOL EKSEKUSI
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: (selectedVehicleId != null && selectedDriverId != null && !isSubmitting)
                  ? _assignTicket 
                  : null, 
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange.shade700,
                disabledBackgroundColor: Colors.orange.shade200,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: isSubmitting 
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text("Tugaskan Sekarang", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
            ),
          ),
          const SizedBox(height: 10), // Jarak ekstra untuk area navigasi bawah layar HP
        ],
      ),
    );
  }
}