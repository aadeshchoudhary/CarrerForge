const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const store = require('../services/dataStore');
const { requireAuth } = require('../middleware/auth');

// GET /api/v1/skills/jobs/sample
router.get('/jobs/sample', (req, res) => {
  return res.json(store.data.jobs);
});

// POST /api/v1/skills/analyze-gap
router.post('/analyze-gap', requireAuth, (req, res) => {
  const { job_id, custom_job_title } = req.body;

  const targetJob = store.data.jobs.find((j) => j.id === job_id) || store.data.jobs[0];
  const userSkills = store.getSkills(req.userId).map((s) => s.name.toLowerCase());

  const essential = targetJob.essential_skills;
  const preferred = targetJob.preferred_skills;

  const matchedEssential = essential.filter((skill) => userSkills.includes(skill.toLowerCase()));
  const missingEssential = essential.filter((skill) => !userSkills.includes(skill.toLowerCase()));

  const matchedPreferred = preferred.filter((skill) => userSkills.includes(skill.toLowerCase()));
  const missingPreferred = preferred.filter((skill) => !userSkills.includes(skill.toLowerCase()));

  const essentialRatio = essential.length > 0 ? matchedEssential.length / essential.length : 1;
  const preferredRatio = preferred.length > 0 ? matchedPreferred.length / preferred.length : 1;

  // Formula: Score = (Matched Essential / Total Essential * 70%) + (Matched Preferred / Total Preferred * 30%)
  const calculatedScore = Math.round((essentialRatio * 70 + preferredRatio * 30) * 10) / 10;

  const report = {
    id: 'gap-' + uuidv4().slice(0, 8),
    user_id: req.userId,
    job_id: targetJob.id,
    coverage_score: calculatedScore,
    matched_skills: [...matchedEssential, ...matchedPreferred],
    missing_essential: missingEssential,
    missing_preferred: missingPreferred,
    needs_evidence: matchedPreferred.length > 0 ? [matchedPreferred[0]] : [],
    formula_breakdown: {
      formula: 'Score = (Matched Essential / Total Essential * 70%) + (Matched Preferred / Total Preferred * 30%)',
      essential_weight_percent: 70,
      preferred_weight_percent: 30,
      total_essential: essential.length,
      matched_essential_count: matchedEssential.length,
      essential_ratio: Math.round(essentialRatio * 100) / 100,
      total_preferred: preferred.length,
      matched_preferred_count: matchedPreferred.length,
      preferred_ratio: Math.round(preferredRatio * 100) / 100,
      calculated_score: calculatedScore,
      interpretation: calculatedScore >= 80
        ? `Strong Match — You meet ${Math.round(essentialRatio * 100)}% of essential requirements for ${custom_job_title || targetJob.title}.`
        : `Moderate Fit — Bridge missing essential skills (${missingEssential.join(', ')}) via targeted learning roadmaps.`,
    },
    improvement_advice: missingPreferred.length > 0
      ? `To reach 95%+ match, add a project demonstrating ${missingPreferred.slice(0, 2).join(' and ')}.`
      : 'Maintain your current placement preparation streak to stand out in technical interview rounds.',
    disclaimer: 'This automated gap score evaluates stated project and resume evidence against market job descriptions.',
    created_at: new Date().toISOString(),
  };

  if (!store.data.gap_reports[req.userId]) {
    store.data.gap_reports[req.userId] = [];
  }
  store.data.gap_reports[req.userId].unshift(report);

  return res.status(201).json(report);
});

// GET /api/v1/skills/reports/:id
router.get('/reports/:id', requireAuth, (req, res) => {
  const reports = store.data.gap_reports[req.userId] || store.data.gap_reports['usr-demo-aarav'];
  const target = reports.find((r) => r.id === req.params.id) || reports[0];
  return res.json(target);
});

module.exports = router;
