require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const hrRoutes = require('./routes/hrRoutes');
const authRoutes = require('./routes/authRoutes');
const meRoutes = require('./routes/meRoutes');
const { requireAuth, requireRole } = require('./middleware/auth');
const { ROLES } = require('./constants/roles');

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = new Set(
  String(process.env.FRONTEND_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
);
allowedOrigins.add('http://localhost:3000');
allowedOrigins.add('http://127.0.0.1:3000');

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/me', requireAuth, requireRole(ROLES.EMPLOYEE), meRoutes);
app.use('/api/hr', requireAuth, requireRole(ROLES.HR_MANAGER), hrRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PeoplePay360 HR & Payroll API',
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

if (require.main === module) {
  const startServer = async () => {
    await connectDB();
    const { bootstrapPersonalLeavePolicy } = require('./services/personalLeavePolicy');
    await bootstrapPersonalLeavePolicy();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  };

  startServer().catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  });
}

module.exports = app;
