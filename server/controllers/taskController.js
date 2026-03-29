const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get tasks for a project
// @route   GET /api/projects/:id/tasks
const getTasks = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const tasks = await Task.find({ project: req.params.id, user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Create task
// @route   POST /api/projects/:id/tasks
const createTask = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, priority, dueDate, status } = req.body;

    const task = await Task.create({
      title,
      description,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      status: status || 'todo',
      project: req.params.id,
      user: req.user._id,
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, status, priority, dueDate } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    const updated = await task.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/tasks/stats
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const total = await Task.countDocuments({ user: userId });
    const completed = await Task.countDocuments({ user: userId, status: 'done' });
    const inProgress = await Task.countDocuments({ user: userId, status: 'inprogress' });
    const overdue = await Task.countDocuments({
      user: userId,
      status: { $ne: 'done' },
      dueDate: { $lt: now },
    });

    const recentTasks = await Task.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('project', 'name color');

    // Last 7 days completion data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await Task.countDocuments({
        user: userId,
        status: 'done',
        updatedAt: { $gte: date, $lt: nextDate },
      });

      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: count,
      });
    }

    res.json({ total, completed, inProgress, overdue, recentTasks, last7Days });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, getDashboardStats };
