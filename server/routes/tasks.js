const express = require('express');
const router = express.Router();
const { updateTask, deleteTask, getDashboardStats } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getDashboardStats);
router.route('/:id').put(updateTask).delete(deleteTask);

module.exports = router;
