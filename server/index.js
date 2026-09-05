const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { ensureDemoData } = require('./config/demoData');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const lotRoutes = require('./routes/lotRoutes');
const entityRoutes = require('./routes/entityRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  const isDatabaseConnected = mongoose.connection.readyState === 1;
  res.status(200).json({ status: 'ok', app: 'Kabadiwala Connect', mode: isDatabaseConnected ? 'database' : 'demo' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lots', lotRoutes);
app.use('/api/entities', entityRoutes);
app.use('/api/transactions', transactionRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong.', error: err.message });
});

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/kabadiwala-connect';

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.warn('MongoDB connection failed. Continuing in demo mode:', error.message);
  }
}

async function startServer() {
  await connectDatabase();

  if (process.env.ENABLE_DEMO_DATA === 'true') {
    await ensureDemoData();
  } else if (mongoose.connection.readyState === 1) {
    console.log('MongoDB persistence enabled; demo seeding is disabled.');
  } else {
    console.warn('Skipping demo seed because MongoDB is not connected.');
  }

  app.listen(PORT, () => {
    console.log(`Kabadiwala Connect server running on http://localhost:${PORT}`);
  });
}

startServer();

module.exports = app;
