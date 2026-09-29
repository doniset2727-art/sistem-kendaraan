Beberapa Komponen yang dipakai:
Backend (REST API) : Node.js
Database : MySQL (Relational Database)
Frontend Web : React.js (Admin & Web User)
Mobile App : Flutter (Karyawan, Approver, Kabag & Supir)
Push Notification : Firebase Cloud Messaging (FCM) 
File Storage : Google Cloud Storage (Lampiran foto struk, tol, & odometer)
Background Queue : Redis

departments
    │
    └──1:N──> users ◄──┐
                │      │ (self-reference: manager_id)
                │      └──────────────┘
                │
                ├──1:1──> drivers
                │
                ├──1:N──> notifications
                │
                └──1:N──> bookings
                              │
                              ├──N:1──> vehicles
                              │
                              └──1:1──> assignments
                                            │
                                            ├──N:1──> vehicles
                                            ├──N:1──> drivers
                                            │
                                            └──1:1──> trip_logs
                                                          │
                                                          └──1:N──> trip_receipts

Ringkasan Relasi
Dari	Relasi	Ke	Keterangan
departments ->	1:N	-> users	( Satu departemen punya banyak user )
users	-> N:1	-> users	( Self-reference lewat manager_id (atasan) )
users	-> 1:1	-> drivers	( Satu user bisa menjadi satu driver )
users	-> 1:N	-> notifications	( Satu user menerima banyak notifikasi )
users	-> 1:N	-> bookings	( Satu user membuat banyak booking )
bookings ->	1:1	-> assignments	( Satu booking menghasilkan satu penugasan )
assignments	-> 1:1	-> trip_logs	( Satu penugasan punya satu log perjalanan )
trip_logs	-> 1:N	-> trip_receipts	( Satu log punya banyak bukti/struk )
bookings / assignments	-> N:1	-> vehicles	( Banyak booking/penugasan memakai satu kendaraan )
assignments / trip_logs	-> N:1	-> drivers	( Satu driver menangani banyak penugasan/perjalanan )

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

5. Untuk Menjalankan Node.js nya :
npx nodemon index.js

(2) Install Alat Enkripsi Password :
npm install bcryptjs

(3) Install Test API : Thunder Client ( VSS Code Extensions )


(4) Install JWT (JSON Web Token) :
npm install jsonwebtoken

(5) Install Paket Swagger :
npm install swagger-ui-express swagger-jsdoc
URL : http://localhost:5000/api-docs

Dokumentasi API (Swagger / Postman): Membuat buku panduan interaktif yang mencatat seluruh endpoint, format JSON, dan aturan otorisasi sistem kita. Ini adalah standar wajib jika Anda bekerja di tim perusahaan nyata agar developer frontend tidak bingung saat memakai API Anda.

(6)Install Paket Wajib (Router & Axios)
kita menginstal dua paket paling penting di React:
*react-router-dom: Untuk membuat navigasi halaman (pindah dari halaman Login ke Dashboard).
*axios: Kurir andalan kita untuk menembak API (GET/POST) ke backend Node.js.
npm install react-router-dom axios

(7) Install/Pasang CORS di Backend (Node.js) : npm install cors

(8) Install React Bootstrap ( Frontend ) : npm install react-bootstrap bootstrap

Fitur FItur yang sudah di Bangun / sudah dibuat :
✅ Sistem Master Data terintegrasi (Departemen, User, Kendaraan, Supir)
✅ Sistem Authentication standar industri menggunakan Token (JWT)
✅ Hirarki persetujuan otomatis (Staff -> Manager)
✅ Sistem Locking/Assignment armada oleh Kabag Kendaraan
✅ Sistem Pelaporan dan Validasi Keuangan Pasca-Trip
✅ Fitur Rekapitulasi Data Otomatis untuk divisi Finance
✅ Sistem Notifikasi Real-time
