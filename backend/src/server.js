require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Resolve exact file paths matching your file structure
const strategyRoutes = require('./routes/strategyRoutes');

let StrategyUser;
try {
  StrategyUser = require('./models/User');
} catch (e) {
  StrategyUser = require('./models/user');
}

const app = express();

// Enable global Cross-Origin routing configurations for frontend mapping
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_QUANT_SIGNING_KEY_XYZ_123';

// ==========================================
// CENTRAL ROUTING HOOK MATRIX (AUTH ENGINE)
// ==========================================

// 1. Isolated Registration Route (Bypasses problematic schema hooks)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All parameters (name, email, password) are mandatory.' });
    }

    // Check if user credentials matrix already exists in Atlas cluster
    const userExists = await StrategyUser.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ error: 'Operator key matching this email already registered.' });
    }

    // Hash account passphrase cleanly in the route controller
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // FIX: Using insertMany bypasses .pre('save') hooks that are throwing "next is not a function"
    await StrategyUser.insertMany([{
      name,
      email: email.toLowerCase(),
      password: hashedPassword
    }]);

    return res.status(201).json({ message: 'Operator registration successfully compiled.' });
  } catch (err) {
    return res.status(500).json({ error: 'Registration Compilation Error: ' + err.message });
  }
});

// 2. Standard Sign In / Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password parameters required.' });
    }

    const user = await StrategyUser.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid security credentials provided.' });
    }

    // Evaluate passphrase matrix match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid security credentials provided.' });
    }

    // Sign a cryptographically secure token matching your backend configuration keys
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Authentication Handshake Failure: ' + err.message });
  }
});

// 3. Quantitative Strategy System Routes
app.use('/api/strategy', strategyRoutes);

// Base Gateway Diagnostics Route
app.get('/health', (req, res) => res.status(200).json({ status: 'healthy', database: mongoose.connection.readyState }));

const PORT = process.env.PORT || 8080;

// Connect to MongoDB and start network listener
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quantedge')
  .then(() => {
    console.log('// DATABASE: Connection link verified.');
    app.listen(PORT, () => console.log(`// GATEWAY: Operational cluster live on port ${PORT}`));
  })
  .catch(err => {
    console.error('// DATABASE: Critical connectivity failure:', err);
  });