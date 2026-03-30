const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, default: '' },
  pinned: { type: Boolean, default: false },
  color: { type: String, default: 'indigo' },
  tags: [{ type: String, trim: true }],
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
