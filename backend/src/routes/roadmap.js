const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../services/dataStore');
const { requireAuth } = require('../middleware/auth');

// GET /api/v1/roadmap/active
router.get('/active', requireAuth, (req, res) => {
  const roadmap = store.data.roadmaps[req.userId] || store.data.roadmaps['usr-demo-aarav'];
  return res.json(roadmap);
});

// POST /api/v1/roadmap/generate
router.post('/generate', requireAuth, (req, res) => {
  const { target_role } = req.body;
  const role = target_role || 'Full Stack Developer';
  const defaultRoadmap = store.data.roadmaps['usr-demo-aarav'];

  const fresh = {
    ...defaultRoadmap,
    id: 'rd-' + uuidv4().slice(0, 8),
    user_id: req.userId,
    role_target: role,
    title: `Comprehensive Zero-to-Placement Mastery: ${role}`,
    items: defaultRoadmap.items.map((it, idx) => ({
      ...it,
      id: `m-item-${idx + 1}`,
      status: idx < 2 ? 'completed' : idx === 2 ? 'in_progress' : 'pending',
    })),
    completed_milestones: 2,
    progress_percentage: 33,
    created_at: new Date().toISOString(),
  };

  store.data.roadmaps[req.userId] = fresh;
  return res.status(201).json(fresh);
});

// PUT /api/v1/roadmap/items/:id/toggle
router.put('/items/:id/toggle', requireAuth, (req, res) => {
  const roadmap = store.data.roadmaps[req.userId] || store.data.roadmaps['usr-demo-aarav'];
  let updatedItem = roadmap.items[0];

  roadmap.items = roadmap.items.map((it) => {
    if (it.id === req.params.id) {
      const nextStatus = it.status === 'completed' ? 'in_progress' : 'completed';
      updatedItem = { ...it, status: nextStatus };
      return updatedItem;
    }
    return it;
  });

  const completedCount = roadmap.items.filter((i) => i.status === 'completed').length;
  roadmap.completed_milestones = completedCount;
  roadmap.progress_percentage = Math.round((completedCount / roadmap.items.length) * 100);

  return res.json(updatedItem);
});

module.exports = router;
