const jwt = require('jsonwebtoken');

// Satpam 1: Mengecek apakah pengunjung membawa "Kartu Akses" (Token JWT) yang sah
exports.verifyToken = (req, res, next) => {
    // 1. Ambil token dari bagian Header (namanya: Authorization)
    const authHeader = req.headers['authorization'];
    
    // Format token biasanya "Bearer jasdklj123klj...", jadi kita ambil kata keduanya saja
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ status: 'Gagal', message: 'Akses Ditolak! Anda belum login (Token tidak ditemukan).' });
    }

    try {
        // 2. Verifikasi keaslian token
        const secretKey = process.env.JWT_SECRET || 'kunci_rahasia_perusahaan_123';
        const decoded = jwt.verify(token, secretKey);
        
        // 3. Jika token asli, simpan data user (id, role, dll) ke dalam 'req' agar bisa dipakai di tahap selanjutnya
        req.user = decoded;
        
        // 4. Lolos pemeriksaan satpam, silakan lanjut masuk ke dalam!
        next(); 
    } catch (error) {
        return res.status(403).json({ status: 'Gagal', message: 'Token tidak valid atau sudah kedaluwarsa! Silakan login ulang.' });
    }
};

// Satpam 2: Mengecek apakah "Jabatan" (Role) pengunjung sesuai dengan ruangan yang mau dimasuki
exports.verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
        // req.user ini kita dapatkan dari hasil kerja Satpam 1 (verifyToken) di atas
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ status: 'Gagal', message: 'Akses Ditolak! Jabatan Anda tidak berhak mengakses rute ini.' });
        }
        
        // Lolos pemeriksaan jabatan, silakan masuk!
        next();
    };
};