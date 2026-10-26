const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../services/dataStore');
const { requireAuth } = require('../middleware/auth');

// GET /api/v1/opportunities/applications
router.get('/applications', requireAuth, (req, res) => {
  const apps = store.data.applications[req.userId] || store.data.applications['usr-demo-aarav'];
  return res.json(apps);
});

// POST /api/v1/opportunities/applications
router.post('/applications', requireAuth, (req, res) => {
  const { company_name, job_title, stage, location, salary_range, job_url, next_interview_date, notes, match_score } = req.body;

  if (!company_name || !job_title) {
    return res.status(400).json({ detail: 'Company name and job title are required' });
  }

  const newApp = {
    id: 'app-' + uuidv4().slice(0, 8),
    user_id: req.userId,
    company_name,
    job_title,
    stage: stage || 'applied',
    location: location || 'Remote / Hybrid',
    salary_range: salary_range || '₹8 - 14 LPA',
    job_url,
    applied_date: new Date().toISOString().split('T')[0],
    next_interview_date,
    notes: notes || 'Application tracked via CareerForge Opportunity Center.',
    match_score: match_score || 85.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!store.data.applications[req.userId]) {
    store.data.applications[req.userId] = [];
  }
  store.data.applications[req.userId].unshift(newApp);

  return res.status(201).json(newApp);
});

// PUT /api/v1/opportunities/applications/:id
router.put('/applications/:id', requireAuth, (req, res) => {
  const apps = store.data.applications[req.userId] || store.data.applications['usr-demo-aarav'];
  let target = apps[0];

  apps.forEach((a) => {
    if (a.id === req.params.id) {
      Object.assign(a, req.body, { updated_at: new Date().toISOString() });
      target = a;
    }
  });

  return res.json(target);
});

// DELETE /api/v1/opportunities/applications/:id
router.delete('/applications/:id', requireAuth, (req, res) => {
  const apps = store.data.applications[req.userId] || store.data.applications['usr-demo-aarav'];
  const filtered = apps.filter((a) => a.id !== req.params.id);
  store.data.applications[req.userId] = filtered;

  return res.json({ status: 'deleted', id: req.params.id });
});

// GET /api/v1/opportunities/applications/stats
router.get('/applications/stats', requireAuth, (req, res) => {
  const apps = store.data.applications[req.userId] || store.data.applications['usr-demo-aarav'];

  return res.json({
    total_applications: apps.length,
    saved_count: apps.filter((a) => a.stage === 'saved').length,
    applied_count: apps.filter((a) => a.stage === 'applied').length,
    screening_count: apps.filter((a) => a.stage === 'screening').length,
    interview_count: apps.filter((a) => a.stage === 'interview').length,
    offer_count: apps.filter((a) => a.stage === 'offer').length,
    rejected_count: apps.filter((a) => a.stage === 'rejected').length,
    active_interviews_count: apps.filter((a) => a.stage === 'interview').length,
  });
});

// GET /api/v1/opportunities/companies
router.get('/companies', (req, res) => {
  const { search, tech } = req.query;
  let comps = store.data.companies;

  if (search) {
    const q = search.toLowerCase();
    comps = comps.filter((c) => c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q));
  }
  if (tech) {
    const t = tech.toLowerCase();
    comps = comps.filter((c) => c.tech_stack.some((st) => st.toLowerCase().includes(t)));
  }

  return res.json(comps);
});

// GET /api/v1/opportunities/interview/questions
router.get('/interview/questions', (req, res) => {
  const { role, type } = req.query;
  const questionsMap = store.data.questions;
  const roleQuestions = questionsMap[role] || questionsMap['Full Stack Developer'];

  if (type && type !== 'all') {
    return res.json(roleQuestions.filter((q) => q.interview_type === type));
  }
  return res.json(roleQuestions);
});

// POST /api/v1/opportunities/interview/evaluate
router.post('/interview/evaluate', requireAuth, (req, res) => {
  const { role_title, interview_type, question_text, user_answer } = req.body;
  const answer = (user_answer || '').trim();
  const wordCount = answer.split(/\s+/).length;

  let score = 75;
  if (wordCount > 60) score += 15;
  else if (wordCount < 20) score -= 25;

  const mentionsAsync = /async|await|event|loop|stream|worker|pool|queue/i.test(answer);
  const mentionsDesign = /star|result|scalab|test|metric|error|idempot/i.test(answer);

  if (mentionsAsync || mentionsDesign) score += 8;
  score = Math.min(98, Math.max(35, score));

  return res.json({
    id: 'eval-' + uuidv4().slice(0, 8),
    role_title,
    interview_type,
    question_text,
    user_answer,
    ai_score: score,
    strengths: [
      'Directly addresses the question prompt with appropriate architectural vocabulary.',
      'Demonstrates strong awareness of non-blocking I/O and production concurrency management.',
      wordCount > 40 ? 'Well-paced articulation of technical tradeoffs.' : 'Concise and professional tone.',
    ],
    areas_for_improvement: [
      wordCount < 50 ? 'Provide a concrete code snippet or real-world project example.' : 'Elaborate on performance metrics under high concurrency.',
      'Mention how you would write automated regression tests to verify this.',
    ],
    suggested_answer:
      'In a production environment, I ensure asynchronous requests do not block the Node.js event loop by offloading CPU-intensive work to worker threads or background worker queues (e.g. BullMQ with Redis). For database queries, I configure connection pooling with explicit timeouts and scoped transactions to guarantee atomic execution.',
    created_at: new Date().toISOString(),
  });
});

// GET /api/v1/opportunities/trends
router.get('/trends', (req, res) => {
  const { category } = req.query;
  if (category && category !== 'all') {
    return res.json(store.data.trends.filter((t) => t.category.toLowerCase().includes(category.toLowerCase())));
  }
  return res.json(store.data.trends);
});

module.exports = router;
