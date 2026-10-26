const express = require('express');
const router = express.Router();
const store = require('../services/dataStore');
const { requireAuth } = require('../middleware/auth');

// GET /api/v1/profile/me
router.get('/me', requireAuth, (req, res) => {
  const career = store.getCareerProfile(req.userId);
  const privacy = store.getPrivacy(req.userId);
  const skills = store.getSkills(req.userId);

  return res.json({
    user_id: req.userId,
    email: 'aarav.sharma@college.edu',
    career_id: career,
    privacy,
    skills,
  });
});

// PUT /api/v1/profile/me
router.put('/me', requireAuth, (req, res) => {
  const updated = store.updateCareerProfile(req.userId, req.body);
  return res.json(updated);
});

// PUT /api/v1/profile/privacy
router.put('/privacy', requireAuth, (req, res) => {
  const updated = store.updatePrivacy(req.userId, req.body);
  return res.json(updated);
});

// GET /api/v1/profile/public/:handle
router.get('/public/:handle', (req, res) => {
  const { handle } = req.params;
  const targetHandle = handle.startsWith('@') ? handle : `@${handle}`;
  const career = store.getCareerProfile('usr-demo-aarav');
  const privacy = store.getPrivacy('usr-demo-aarav');
  const skills = store.getSkills('usr-demo-aarav');

  return res.json({
    career_id: { ...career, handle: targetHandle },
    privacy,
    skills: privacy.show_skills ? skills : [],
  });
});

module.exports = router;
