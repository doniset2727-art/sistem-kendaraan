const express = require('express');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const cors = require('cors');
const db = require('./config/database'); // Memanggil file koneksi database
require('dotenv').config();

// 1. Panggil Semua Model
const Department = require('./models/Department');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Driver = require('./models/Driver');
const Booking = require('./models/Booking');
const Assignment = require('./models/Assignment');
const TripLog = require('./models/TripLog');
const TripReceipt = require('./models/TripReceipt');
const Notification = require('./models/Notification');

// 2. SETUP RELASI (FOREIGN KEY)
// Departemen - User
Department.hasMany(User, { foreignKey: 'department_id' });
User.belongsTo(Department, { foreignKey: 'department_id' });

// Atasan - Bawahan (Hirarki)
User.hasMany(User, { as: 'Subordinates', foreignKey: 'manager_id' });
User.belongsTo(User, { as: 'Manager', foreignKey: 'manager_id' });

// User - Driver
User.hasOne(Driver, { foreignKey: 'user_id' });
Driver.belongsTo(User, { foreignKey: 'user_id' });

// User - Booking (Pemesan & Approver)
User.hasMany(Booking, { foreignKey: 'user_id', as: 'MyBookings' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'Pemesan' });
User.hasMany(Booking, { foreignKey: 'approver_id', as: 'Approvals' });
Booking.belongsTo(User, { foreignKey: 'approver_id', as: 'Approver' });

// Booking - Assignment
Booking.hasOne(Assignment, { foreignKey: 'booking_id' });
Assignment.belongsTo(Booking, { foreignKey: 'booking_id' });
Vehicle.hasMany(Assignment, { foreignKey: 'vehicle_id' });
Assignment.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });
Driver.hasMany(Assignment, { foreignKey: 'driver_id' });
Assignment.belongsTo(Driver, { foreignKey: 'driver_id' });
User.hasMany(Assignment, { foreignKey: 'assigned_by', as: 'AssignedTasks' });
Assignment.belongsTo(User, { foreignKey: 'assigned_by', as: 'Kabag' });

// Booking - Trip Log & Receipts
Booking.hasOne(TripLog, { foreignKey: 'booking_id' });
TripLog.belongsTo(Booking, { foreignKey: 'booking_id' });
Driver.hasMany(TripLog, { foreignKey: 'driver_id' });
TripLog.belongsTo(Driver, { foreignKey: 'driver_id' });
User.hasMany(TripLog, { foreignKey: 'validated_by', as: 'ValidatedTrips' });
TripLog.belongsTo(User, { foreignKey: 'validated_by', as: 'AdminValidator' });

TripLog.hasMany(TripReceipt, { foreignKey: 'trip_log_id' });
TripReceipt.belongsTo(TripLog, { foreignKey: 'trip_log_id' });

// User - Notifications
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

const app = express();
app.use(cors());
app.use(express.json());

// Konfigurasi Swagger
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API Sistem Kendaraan Perusahaan',
            version: '1.0.0',
            description: 'Dokumentasi interaktif untuk API Sistem Manajemen Kendaraan'
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Local Development Server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        }
    },
    apis: ['./routes/*.js'], 
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Daftar Routes
const departmentRoutes = require('./routes/departmentRoutes');
app.use('/api/v1/departments', departmentRoutes);
const userRoutes = require('./routes/UserRoutes');
app.use('/api/v1/users', userRoutes);
const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/v1/bookings', bookingRoutes);
const vehicleRoutes = require('./routes/vehicleRoutes');
app.use('/api/v1/vehicles', vehicleRoutes);
const driverRoutes = require('./routes/driverRoutes');
app.use('/api/v1/drivers', driverRoutes);
const assignmentRoutes = require('./routes/assignmentRoutes');
app.use('/api/v1/assignments', assignmentRoutes);
const tripLogRoutes = require('./routes/tripLogRoutes');
app.use('/api/v1/trip-logs', tripLogRoutes);
const tripReceiptRoutes = require('./routes/tripReceiptRoutes');
app.use('/api/v1/trip-receipts', tripReceiptRoutes);
const reportRoutes = require('./routes/reportRoutes');
app.use('/api/v1/reports', reportRoutes);
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/v1/notifications', notificationRoutes);

// Mengecek Koneksi ke Database
db.authenticate()
    .then(() => {
        console.log('✅ Mantap! Database MySQL berhasil terkoneksi!');
        
        // 👇 PENYESUAIAN KRUSIAL: Tambahkan { alter: true } agar MySQL otomatis menyesuaikan kolom baru
        return db.sync({ alter: true });
    })
    .then(() => {
        console.log('📦 Sinkronisasi Final selesai! Struktur tabel sudah ter-update secara otomatis.');
    })
    .catch(err => console.error('❌ Gagal:', err));

// Route Test
app.get('/', (req, res) => {
    res.json({ status: 'Sukses', message: 'API Sistem Kendaraan berjalan lancar!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});