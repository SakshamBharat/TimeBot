const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Timetable = require('./models/Timetable');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect('mongodb+srv://sakshambharatuk_db_user:3MiAboUvFg699gi3@timebot.cpz3uas.mongodb.net/?retryWrites=true&w=majority&appName=TimeBot', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Home route
app.get('/', async (req, res) => {
  const timetables = await Timetable.find().sort({ section: 1 });
  res.render('index', { timetables });
});

// Create timetable
app.post('/create', async (req, res) => {
  const { course, year, section, branch } = req.body;

  const existing = await Timetable.findOne({ section });
  if (existing) {
    return res.send(`<h2>Timetable for section ${section} already exists.</h2><a href="/">Back to Home</a>`);
  }

  const timetable = new Timetable({ course, year, section, branch });
  await timetable.save();

  res.redirect(`/timetable/section/${section}`);
});

// View timetable by section
app.get('/timetable/section/:section', async (req, res) => {
  const { section } = req.params;

  const timetable = await Timetable.findOne({
    section: new RegExp(`^${section}$`, 'i')
  });

  if (!timetable) {
    return res.status(404).send(`Timetable not found for section: ${section}`);
  }

  res.render('timetable', { timetable });
});

// Add slot to timetable
app.post('/add-slot', async (req, res) => {
  const { section, day, time, subject, teacher, type, classroom } = req.body;

  const timetable = await Timetable.findOne({
    section: new RegExp(`^${section}$`, 'i')
  });

  if (!timetable) return res.status(404).send('Timetable not found');

  // Remove any existing slot at same day/time
  timetable.slots = timetable.slots.filter(s => !(s.day === day && s.time === time));

  // Add new slot
  timetable.slots.push({ day, time, subject, teacher, type, classroom });

  await timetable.save();
  res.status(200).json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
