const express = require('express');
const router = express.Router();
const store = require('../services/dataStore');
const { requireAuth } = require('../middleware/auth');

// GET /api/v1/dashboard/summary
router.get('/summary', requireAuth, (req, res) => {
  const career = store.getCareerProfile(req.userId);
  const reports = store.data.gap_reports[req.userId] || store.data.gap_reports['usr-demo-aarav'];
  const latestGap = reports ? reports[0] : null;

  const summary = {
    career_profile: career,
    readiness: {
      technical_score: 88,
      project_score: 92,
      resume_score: 90,
      interview_score: 82,
      overall_score: 88,
      summary_text: 'Campus Placement Ready — Top 5% among peer engineering cohort.',
    },
    latest_gap_report: latestGap,
    next_best_action: {
      title: 'Complete System Design Interview Simulation',
      subtitle: 'Practice real-time microservices design questions to boost your Interview Readiness.',
      cta_label: 'Start Interview Gym',
      cta_link: '/interview-gym',
      type: 'interview',
    },
    active_quests: [
      { id: 'q1', title: 'Verify First GitHub Project Proof', description: 'Submit repository link for automated verification', xp_reward: 120, progress: 1, total: 1, is_completed: true },
      { id: 'q2', title: 'Complete Skill Gap Analysis', description: 'Analyze resume against target Full Stack role', xp_reward: 50, progress: 1, total: 1, is_completed: true },
      { id: 'q3', title: 'Export ATS Compliant Resume', description: 'Build and download ATS optimized resume', xp_reward: 25, progress: 1, total: 1, is_completed: true },
      { id: 'q4', title: 'Score 80%+ in Interview Gym', description: 'Practice technical questions with AI evaluation', xp_reward: 75, progress: 0, total: 1, is_completed: false },
    ],
    recent_skills: [
      { name: 'Express.js', category: 'Backend', evidence_level: 'verified' },
      { name: 'React', category: 'Frontend', evidence_level: 'verified' },
      { name: 'PostgreSQL', category: 'Database', evidence_level: 'verified' },
      { name: 'Docker', category: 'DevOps', evidence_level: 'assessed' },
    ],
  };

  return res.json(summary);
});

module.exports = router;
