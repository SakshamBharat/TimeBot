const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  day: String,
  time: String,
  subject: String,
  teacher: String,
  type: String,
  classroom: String
});

const timetableSchema = new mongoose.Schema({
  course: String,
  year: String,
  section: { type: String, unique: true }, // Ensure unique section names
  branch: String,
  slots: [slotSchema]
});

module.exports = mongoose.model('Timetable', timetableSchema);
