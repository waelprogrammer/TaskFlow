const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  emoji: { type: String, default: '⭐' },
  color: { type: String, default: 'indigo' },
  completedDates: [{ type: String }], // stored as 'YYYY-MM-DD' strings
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
