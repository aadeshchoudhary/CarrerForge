const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const store = require('../services/dataStore');
const { requireAuth } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/v1/resume/upload
router.post('/upload', requireAuth, upload.single('file'), (req, res) => {
  const filename = req.file ? req.file.originalname : 'Candidate_Resume.pdf';
  const fileType = filename.endsWith('.docx') ? 'docx' : 'pdf';

  const defaultParsed = store.data.resumes['usr-demo-aarav'][0].parsed_data;
  const parsedData = {
    ...defaultParsed,
    id: 'parsed-' + uuidv4().slice(0, 8),
    personal_info: {
      ...defaultParsed.personal_info,
      full_name: filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Aarav Sharma',
    },
    updated_at: new Date().toISOString(),
  };

  const resumeObj = {
    id: 'res-' + uuidv4().slice(0, 8),
    filename,
    file_type: fileType,
    uploaded_at: new Date().toISOString(),
    parsed_data: parsedData,
  };

  if (!store.data.resumes[req.userId]) {
    store.data.resumes[req.userId] = [];
  }
  store.data.resumes[req.userId].unshift(resumeObj);

  return res.status(201).json(resumeObj);
});

// GET /api/v1/resume/latest
router.get('/latest', requireAuth, (req, res) => {
  const userResumes = store.data.resumes[req.userId] || store.data.resumes['usr-demo-aarav'];
  const latest = userResumes[0];
  return res.json(latest);
});

// PUT /api/v1/resume/:id/review
router.put('/:id/review', requireAuth, (req, res) => {
  const userResumes = store.data.resumes[req.userId] || store.data.resumes['usr-demo-aarav'];
  const target = userResumes.find((r) => r.id === req.params.id) || userResumes[0];

  const updatedParsed = {
    ...target.parsed_data,
    ...req.body,
    updated_at: new Date().toISOString(),
  };
  target.parsed_data = updatedParsed;

  return res.json(updatedParsed);
});

module.exports = router;
