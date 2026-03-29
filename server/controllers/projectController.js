const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all projects for user
// @route   GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Add task counts to each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ project: project._id });
        const completedCount = await Task.countDocuments({ project: project._id, status: 'done' });
        return {
          ...project.toObject(),
          taskCount,
          completedCount,
        };
      })
    );

    res.json(projectsWithCounts);
  } catch (error) {
    next(error);
  }
};

// @desc    Create project
// @route   POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    const project = await Project.create({
      name,
      description,
      color: color || '#6366f1',
      user: req.user._id,
    });

    res.status(201).json({ ...project.toObject(), taskCount: 0, completedCount: 0 });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, description, color } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;

    const updated = await project.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete all tasks in this project
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProjects, createProject, updateProject, deleteProject };
