const express = require('express');
const router = express.Router();
const store = require('../services/dataStore');
const { requireAuth } = require('../middleware/auth');

// GET /api/v1/gamification/badges
router.get('/badges', requireAuth, (req, res) => {
  return res.json(store.data.badges);
});

// GET /api/v1/gamification/leaderboard
router.get('/leaderboard', requireAuth, (req, res) => {
  const leaderboard = {
    current_user_rank: 4,
    total_participants: 128,
    disclaimer: 'Rankings are updated dynamically based on verified project proof, study consistency, and peer contributions.',
    rankings: [
      { rank: 1, handle: '@priya_sharma', full_name: 'Priya Sharma', target_role: 'Full Stack Developer', level: 4, weekly_xp: 320, total_xp: 1120, verified_projects_count: 3, badges_count: 6, is_current_user: false },
      { rank: 2, handle: '@rohit_verma', full_name: 'Rohit Verma', target_role: 'Machine Learning Engineer', level: 4, weekly_xp: 290, total_xp: 980, verified_projects_count: 2, badges_count: 5, is_current_user: false },
      { rank: 3, handle: '@ananya_data', full_name: 'Ananya Iyer', target_role: 'Data Analyst', level: 3, weekly_xp: 240, total_xp: 810, verified_projects_count: 2, badges_count: 4, is_current_user: false },
      { rank: 4, handle: '@aarav_sharma', full_name: 'Aarav Sharma', target_role: 'Full Stack Developer', level: 3, weekly_xp: 210, total_xp: 740, verified_projects_count: 2, badges_count: 4, is_current_user: true },
      { rank: 5, handle: '@aarav_cloud', full_name: 'Aarav Patel', target_role: 'Cloud & DevOps Associate', level: 2, weekly_xp: 180, total_xp: 620, verified_projects_count: 1, badges_count: 3, is_current_user: false },
    ],
  };

  return res.json(leaderboard);
});

module.exports = router;
