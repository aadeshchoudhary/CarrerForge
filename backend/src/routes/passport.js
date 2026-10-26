const express = require('express');
const router = express.Router();
const store = require('../services/dataStore');
const { requireAuth } = require('../middleware/auth');

// GET /api/v1/passport/me
router.get('/me', requireAuth, (req, res) => {
  const profile = store.getCareerProfile(req.userId);
  const passport = store.data.passports[req.userId] || store.data.passports['usr-demo-aarav'];

  return res.json({
    ...passport,
    handle: profile.handle,
    full_name: profile.full_name,
    target_role: profile.target_role,
    level: profile.current_level,
    total_xp: profile.xp_points,
  });
});

// GET /api/v1/passport/verify/:handle
router.get('/verify/:handle', (req, res) => {
  const { handle } = req.params;
  const targetHandle = handle.startsWith('@') ? handle : `@${handle}`;
  const profile = store.getCareerProfile('usr-demo-aarav');
  const passport = store.data.passports['usr-demo-aarav'];

  return res.json({
    ...passport,
    handle: targetHandle,
    full_name: profile.full_name,
    target_role: profile.target_role,
    level: profile.current_level,
    total_xp: profile.xp_points,
  });
});

module.exports = router;
