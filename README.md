Beberapa Komponen yang dipakai:
Backend (REST API) : Node.js
Database : MySQL (Relational Database)
Frontend Web : React.js (Admin & Web User)
Mobile App : Flutter (Karyawan, Approver, Kabag & Supir)
Push Notification : Firebase Cloud Messaging (FCM) 
File Storage : Google Cloud Storage (Lampiran foto struk, tol, & odometer)
Background Queue : Redis

departments] ──1:N──> [users] (Self-referencing manager_id)
                         │
                         ├──1:N──> [bookings] ──1:1──> [assignments] ──1:1──> [trip_logs] ──1:N──> [trip_receipts]
                         │            │                     │                     │
                         │            │                     ├──N:1──> [vehicles] ──┘
                         │            │                     │
                         └────────────┴─────────────────────┴──N:1──> [drivers]
[notifications] <──N:1── [users]
[drivers]       <──1:1── [users]

(1) Step-step Inisialisasi Project Server

1. Buat folder untuk backend dan masuk ke foldernya:
mkdir sistem-kendaraan
cd sistem-kendaraan

2. Inisialisasi project Node.js:
npm init -y

3. Install library utama yang kita butuhkan:
npm install express cors dotenv mysql2 sequelize

4. Install tools tambahan untuk mempermudah saat coding:
npm install --save-dev nodemon

5. Untuk Menjalankan Node.js nya
npx nodemon index.js

(2) Install Alat Enkripsi Password
npm install bcryptjs

(3) Install Test API : Thunder Client ( VSS Code Extensions )


(4) Install JWT (JSON Web Token)
npm install jsonwebtoken

Fitur FItur yang sudah di Bangun / sudah dibuat :
✅ Sistem Master Data terintegrasi (Departemen, User, Kendaraan, Supir)
✅ Sistem Authentication standar industri menggunakan Token (JWT)
✅ Hirarki persetujuan otomatis (Staff -> Manager)
✅ Sistem Locking/Assignment armada oleh Kabag Kendaraan
✅ Sistem Pelaporan dan Validasi Keuangan Pasca-Trip
✅ Fitur Rekapitulasi Data Otomatis untuk divisi Finance
✅ Sistem Notifikasi Real-time
