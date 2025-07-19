const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/carbon_footprint', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Entry Schema & Model
const entrySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  activity: String,
  emission: Number, // in kg CO2e
});
const Entry = mongoose.model('Entry', entrySchema);

// User Schema & Model
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model('User', userSchema);

// Register Route -- THIS IS THE CRITICAL PART!
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hash });
    await user.save();
    // The following line is ESSENTIAL: always send a JSON response!
    return res.json({ success: true });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    return res.status(500).json({ error: err.message });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Entries Routes
app.get('/api/entries', async (req, res) => {
  const entries = await Entry.find().sort({ date: -1 });
  res.json(entries);
});

app.post('/api/entries', async (req, res) => {
  const { activity, emission } = req.body;
  const entry = new Entry({ activity, emission });
  await entry.save();
  res.json(entry);
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});