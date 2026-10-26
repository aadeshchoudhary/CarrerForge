const express = require('express');
const router = express.Router();
const store = require('../services/dataStore');

// GET /api/v1/resources/search
router.get('/search', (req, res) => {
  const { skill, resource_type, difficulty, free_only } = req.query;
  let list = store.data.resources;

  if (skill) {
    const q = skill.toLowerCase();
    list = list.filter((r) => r.skill_normalized.toLowerCase().includes(q) || r.title.toLowerCase().includes(q));
  }
  if (resource_type && resource_type !== 'all') {
    list = list.filter((r) => r.resource_type === resource_type);
  }
  if (difficulty && difficulty !== 'all') {
    list = list.filter((r) => r.difficulty.toLowerCase() === difficulty.toLowerCase());
  }
  if (free_only === 'true' || free_only === true) {
    list = list.filter((r) => r.is_free);
  }

  return res.json(list);
});

module.exports = router;
