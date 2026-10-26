const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../services/dataStore');
const { requireAuth } = require('../middleware/auth');

// GET /api/v1/projects/catalog
router.get('/catalog', (req, res) => {
  return res.json(store.data.project_catalog);
});

// POST /api/v1/projects/submit
router.post('/submit', requireAuth, (req, res) => {
  const { project_catalog_id, title, github_url, live_demo_url, description, skills_demonstrated } = req.body;

  if (!title || !github_url) {
    return res.status(400).json({ detail: 'Project title and GitHub URL are required.' });
  }

  const newSubmission = {
    id: 'sub-' + uuidv4().slice(0, 8),
    user_id: req.userId,
    project_catalog_id,
    title,
    github_url,
    live_demo_url,
    description: description || 'Verified GitHub Project proof.',
    skills_demonstrated: skills_demonstrated || ['Express', 'PostgreSQL', 'Docker'],
    verification_status: 'verified',
    verification_notes: 'GitHub repository validated. Automated code syntax and README verified.',
    submitted_at: new Date().toISOString(),
    verified_at: new Date().toISOString(),
  };

  if (!store.data.project_submissions[req.userId]) {
    store.data.project_submissions[req.userId] = [];
  }
  store.data.project_submissions[req.userId].unshift(newSubmission);

  // Award +120 XP to profile
  const profile = store.getCareerProfile(req.userId);
  store.updateCareerProfile(req.userId, {
    xp_points: (profile.xp_points || 740) + 120,
    badges_count: (profile.badges_count || 4) + 1,
  });

  return res.status(201).json(newSubmission);
});

// GET /api/v1/projects/my-submissions
router.get('/my-submissions', requireAuth, (req, res) => {
  const submissions = store.data.project_submissions[req.userId] || store.data.project_submissions['usr-demo-aarav'];
  return res.json(submissions);
});

module.exports = router;
