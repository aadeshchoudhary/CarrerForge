const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../services/dataStore');
const { requireAuth } = require('../middleware/auth');

// GET /api/v1/tracker/summary
router.get('/summary', requireAuth, (req, res) => {
  const userGoals = store.data.goals[req.userId] || store.data.goals['usr-demo-aarav'];
  const userLogs = store.data.study_logs[req.userId] || store.data.study_logs['usr-demo-aarav'];

  const completedGoals = userGoals.filter((g) => g.is_completed).length;
  const totalHours = userLogs.reduce((acc, log) => acc + log.hours_spent, 33.0);

  return res.json({
    total_goals_today: userGoals.length,
    completed_goals_today: completedGoals,
    completion_rate_percent: userGoals.length > 0 ? Math.round((completedGoals / userGoals.length) * 100) : 0,
    total_study_hours_this_week: Math.round(totalHours * 10) / 10,
    consecutive_days_streak: 7,
    goals: userGoals,
    recent_logs: userLogs,
  });
});

// POST /api/v1/tracker/goals
router.post('/goals', requireAuth, (req, res) => {
  const { title, category, target_date } = req.body;
  if (!title) {
    return res.status(400).json({ detail: 'Goal title is required' });
  }

  const newGoal = {
    id: 'goal-' + uuidv4().slice(0, 8),
    user_id: req.userId,
    title,
    category: category || 'General',
    is_completed: false,
    source_type: 'custom',
    created_at: new Date().toISOString(),
    target_date: target_date || new Date().toISOString().split('T')[0],
  };

  if (!store.data.goals[req.userId]) {
    store.data.goals[req.userId] = [];
  }
  store.data.goals[req.userId].unshift(newGoal);

  return res.status(201).json(newGoal);
});

// PUT /api/v1/tracker/goals/:id/toggle
router.put('/goals/:id/toggle', requireAuth, (req, res) => {
  const userGoals = store.data.goals[req.userId] || store.data.goals['usr-demo-aarav'];
  let updatedGoal = userGoals[0];

  userGoals.forEach((g) => {
    if (g.id === req.params.id) {
      g.is_completed = !g.is_completed;
      g.completed_at = g.is_completed ? new Date().toISOString() : undefined;
      updatedGoal = g;
    }
  });

  return res.json(updatedGoal);
});

// POST /api/v1/tracker/log-study
router.post('/log-study', requireAuth, (req, res) => {
  const { topic, hours_spent, notes } = req.body;
  if (!topic || !hours_spent) {
    return res.status(400).json({ detail: 'Topic and hours_spent are required' });
  }

  const newLog = {
    id: 'log-' + uuidv4().slice(0, 8),
    topic,
    hours_spent: parseFloat(hours_spent),
    notes,
    logged_date: new Date().toISOString().split('T')[0],
  };

  if (!store.data.study_logs[req.userId]) {
    store.data.study_logs[req.userId] = [];
  }
  store.data.study_logs[req.userId].unshift(newLog);

  // Award +15 XP for logging study
  const career = store.getCareerProfile(req.userId);
  store.updateCareerProfile(req.userId, { xp_points: (career.xp_points || 740) + 15 });

  return res.status(201).json(newLog);
});

module.exports = router;
