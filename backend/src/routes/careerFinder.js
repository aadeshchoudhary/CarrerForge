const express = require('express');
const router = express.Router();

// GET /api/v1/career-finder/explore
router.get('/explore', (req, res) => {
  const roles = [
    {
      job_id: 'job-1',
      title: 'Full Stack Developer',
      company: 'Industry Benchmark',
      location: 'Bengaluru / Remote',
      experience_level: 'Fresher / Entry Level',
      compatibility_score: 86.5,
      is_current_target: true,
      essential_skills: ['React', 'Express', 'JavaScript', 'PostgreSQL', 'Docker', 'Git'],
      preferred_skills: ['TypeScript', 'Redis', 'Tailwind CSS'],
      matched_skills: ['React', 'Express', 'JavaScript', 'PostgreSQL', 'Git'],
      missing_essential: ['Docker'],
      reasons: ['Your verified skills in React, JavaScript, and SQL align directly with full stack requirements.'],
      improvement_focus: ['Complete Docker containerization project', 'Add Redis caching layer'],
    },
    {
      job_id: 'job-2',
      title: 'Data Analyst',
      company: 'Industry Benchmark',
      location: 'Hyderabad / Hybrid',
      experience_level: 'Fresher / Entry Level',
      compatibility_score: 75.0,
      is_current_target: false,
      essential_skills: ['SQL', 'Python', 'Pandas', 'Excel'],
      preferred_skills: ['PowerBI', 'Tableau', 'PostgreSQL'],
      matched_skills: ['SQL', 'Python', 'PostgreSQL'],
      missing_essential: ['Pandas'],
      reasons: ['Strong SQL and Python foundation; complete PowerBI module to reach 90%+ match.'],
      improvement_focus: ['Learn Pandas data manipulation', 'Build PowerBI dashboard'],
    },
    {
      job_id: 'job-3',
      title: 'Machine Learning Engineer',
      company: 'Industry Benchmark',
      location: 'Pune / Hybrid',
      experience_level: 'Fresher / Entry Level',
      compatibility_score: 68.0,
      is_current_target: false,
      essential_skills: ['Python', 'PyTorch', 'Scikit-Learn', 'Linear Algebra'],
      preferred_skills: ['Express', 'Docker', 'OpenCV'],
      matched_skills: ['Python', 'Express', 'Docker'],
      missing_essential: ['PyTorch', 'Linear Algebra'],
      reasons: ['Good programming foundation; complete model training and PyTorch labs to bridge gap.'],
      improvement_focus: ['PyTorch deep learning fundamentals', 'Model evaluation metrics'],
    },
    {
      job_id: 'job-4',
      title: 'Cloud & DevOps Associate',
      company: 'Industry Benchmark',
      location: 'Noida / Remote',
      experience_level: 'Junior / 1 Year',
      compatibility_score: 62.5,
      is_current_target: false,
      essential_skills: ['Linux', 'Docker', 'Git', 'CI/CD'],
      preferred_skills: ['Kubernetes', 'Python', 'AWS'],
      matched_skills: ['Docker', 'Git', 'Linux'],
      missing_essential: ['CI/CD'],
      reasons: ['Familiarity with Git and Docker; learn CI/CD pipelines to excel.'],
      improvement_focus: ['Linux shell scripting', 'GitHub Actions workflow'],
    },
  ];

  return res.json(roles);
});

module.exports = router;
