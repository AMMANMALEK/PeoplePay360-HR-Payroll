require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const hrRoutes = require('./routes/hrRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/hr', hrRoutes);

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
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
