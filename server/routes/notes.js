const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET all notes
router.get('/', async (req, res, next) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({ pinned: -1, updatedAt: -1 });
    res.json(notes);
  } catch (err) { next(err); }
});

// POST create note
router.post('/', async (req, res, next) => {
  try {
    const { title, content, color, tags } = req.body;
    const note = await Note.create({ user: req.user._id, title, content, color, tags });
    res.status(201).json(note);
  } catch (err) { next(err); }
});

// PUT update note
router.put('/:id', async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) { next(err); }
});

// DELETE note
router.delete('/:id', async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
