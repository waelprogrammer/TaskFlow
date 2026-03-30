const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET all habits
router.get('/', async (req, res, next) => {
  try {
    const habits = await Habit.find({ user: req.user._id }).sort({ createdAt: 1 });
    res.json(habits);
  } catch (err) { next(err); }
});

// POST create habit
router.post('/', async (req, res, next) => {
  try {
    const { title, emoji, color } = req.body;
    const habit = await Habit.create({ user: req.user._id, title, emoji, color });
    res.status(201).json(habit);
  } catch (err) { next(err); }
});

// PUT toggle today
router.put('/:id/toggle', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    if (habit.completedDates.includes(today)) {
      habit.completedDates = habit.completedDates.filter(d => d !== today);
    } else {
      habit.completedDates.push(today);
    }
    await habit.save();
    res.json(habit);
  } catch (err) { next(err); }
});

// DELETE habit
router.delete('/:id', async (req, res, next) => {
  try {
    await Habit.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
