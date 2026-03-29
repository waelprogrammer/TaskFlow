const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// All admin routes require auth + admin flag
router.use(protect, adminOnly);

// GET /api/admin/users — list all users with stats
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [taskCount, projectCount] = await Promise.all([
          Task.countDocuments({ user: user._id }),
          Project.countDocuments({ user: user._id }),
        ]);
        return { ...user.toObject(), taskCount, projectCount };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/users/:id — delete a user and all their data
router.delete('/users/:id', async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't delete yourself" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await Task.deleteMany({ user: user._id });
    await Project.deleteMany({ user: user._id });
    await user.deleteOne();

    res.json({ message: 'User and all their data deleted' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/users/:id/reset-password — reset a user's password
router.put('/users/:id/reset-password', async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    res.json({ message: `Password reset for ${user.name}` });
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/users/:id/toggle-admin — promote/demote admin
router.put('/users/:id/toggle-admin', async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't change your own admin status" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isAdmin = !user.isAdmin;
    await user.save();

    res.json({ message: `${user.name} is now ${user.isAdmin ? 'an admin' : 'a regular user'}` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
