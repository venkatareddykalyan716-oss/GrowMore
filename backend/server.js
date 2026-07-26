const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

const app = express();

// ✅ Add this line for Render
app.set('trust proxy', 1);

connectDB().then(async () => {
  const migrateAdmins = require('./migrateAdmins');
  await migrateAdmins();

  try {
    const Admin = require('./models/Admin');
    const User = require('./models/User');

    const defaultAdmins = [
      { phone: '9346697486', name: 'kalyan' },
      { phone: '9346697487', name: 'Kalyan Venkata Reddy' }
    ];

    for (const adminData of defaultAdmins) {
      let adminObj = await Admin.findOne({ phone: adminData.phone });
      if (!adminObj) {
        await Admin.create({
          name: adminData.name,
          phone: adminData.phone,
          password: 'Kalyan989@', // Will be hashed automatically by pre-save hook in Admin.js
          role: 'admin'
        });
        console.log(`🛡️ [Startup] Created admin ${adminData.phone} with password Kalyan989@`);
      } else {
        adminObj.password = 'Kalyan989@'; // Sync password
        await adminObj.save();
        console.log(`🛡️ [Startup] Updated admin password for ${adminData.phone} to Kalyan989@`);
      }
      // Keep collections clean
      await User.deleteOne({ phone: adminData.phone });
    }
  } catch (err) {
    console.error('❌ Error during admin startup seeding:', err);
  }
});

app.use(helmet({
  contentSecurityPolicy: false
}));

app.set('trust proxy', 1);

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://growmore4.netlify.app',
    'https://growmoree.dpdns.org'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000 // Raised for development and testing
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/plans', require('./routes/plans'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/gift', require('./routes/giftRoutes'));
app.use('/api/bank', require('./routes/bank'));

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    app: 'GrowMore',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});



app.get('/', (req, res) => {
  res.json({ 
    success: true,
    app: 'GrowMore',
    message: 'Welcome to GrowMore API',
    version: '1.0.0'
  });
});

app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found in GrowMore' 
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'GrowMore server error' 
  });
});

const http = require('http');
const socketIo = require('socket.io');

const PORT = process.env.PORT || 5005; // Use 5005 as hotfixed earlier
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://growmore4.netlify.app',
      'https://growmoree.dpdns.org'
    ],
    credentials: true
  }
});

// Track active sockets and manage join requests
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);
  
  socket.on('join', (userId) => {
    socket.join(userId.toString());
    console.log(`👤 User joined private socket room: ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Expose Socket.io instance globally in the app context
app.set('io', io);

server.listen(PORT, () => {
  console.log(`🚀 GrowMore Server with Socket.io running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});
