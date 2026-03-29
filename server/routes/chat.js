const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const { protect } = require('../middleware/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');

router.post('/', protect, async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    // Get user's real-time data for context
    const [tasks, projects] = await Promise.all([
      Task.find({ user: req.user._id }).select('title status priority dueDate').limit(20),
      Project.find({ user: req.user._id }).select('name').limit(10),
    ]);

    const now = new Date();
    const overdue = tasks.filter(t => t.dueDate && t.status !== 'done' && new Date(t.dueDate) < now);
    const done = tasks.filter(t => t.status === 'done');
    const inprogress = tasks.filter(t => t.status === 'inprogress');

    const systemPrompt = `You are TaskFlow AI, a friendly and helpful productivity assistant built into TaskFlow — a task management web app.

Your job is ONLY to help the user with:
- Their tasks and projects inside TaskFlow
- How to use TaskFlow features (Kanban board, projects, filters, drag & drop, export CSV, Pomodoro timer, etc.)
- Productivity tips and task management advice
- Motivation and encouragement

Do NOT answer questions outside this scope (politics, general knowledge, coding help unrelated to TaskFlow, etc.). If asked something off-topic, politely redirect to TaskFlow topics.

Current user data (live):
- Name: ${req.user.name}
- Total tasks: ${tasks.length}
- Completed: ${done.length}
- In progress: ${inprogress.length}
- Overdue: ${overdue.length}
- Projects: ${projects.map(p => p.name).join(', ') || 'No projects yet'}
${overdue.length > 0 ? `- Overdue task titles: ${overdue.map(t => t.title).join(', ')}` : ''}

Style: Be warm, concise, and use markdown (bold, bullet points). Use emojis occasionally. Keep replies under 150 words unless a detailed explanation is needed.`;

    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-8).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      max_tokens: 400,
      temperature: 0.7,
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
