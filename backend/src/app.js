const express = require('express');
const cors = require('cors');
const config = require('./config');

// Route modules
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const resumeRoutes = require('./routes/resume');
const skillsRoutes = require('./routes/skills');
const dashboardRoutes = require('./routes/dashboard');
const resumeBuilderRoutes = require('./routes/resumeBuilder');
const careerFinderRoutes = require('./routes/careerFinder');
const roadmapRoutes = require('./routes/roadmap');
const resourcesRoutes = require('./routes/resources');
const trackerRoutes = require('./routes/tracker');
const projectsRoutes = require('./routes/projects');
const passportRoutes = require('./routes/passport');
const gamificationRoutes = require('./routes/gamification');
const communityRoutes = require('./routes/community');
const opportunitiesRoutes = require('./routes/opportunities');

const app = express();

// 1. Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2. Health & Diagnostic Endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    project: 'CareerForge AI — Express.js Engine',
    version: '2.0.0',
    phase: 'All 5 Phases Operational & Production Ready',
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', runtime: 'Node.js Express' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', runtime: 'Node.js Express' });
});

// 3. API V1 Routers
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/profile', profileRoutes);
apiRouter.use('/resume', resumeRoutes);
apiRouter.use('/skills', skillsRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/resume-builder', resumeBuilderRoutes);
apiRouter.use('/career-finder', careerFinderRoutes);
apiRouter.use('/roadmap', roadmapRoutes);
apiRouter.use('/resources', resourcesRoutes);
apiRouter.use('/tracker', trackerRoutes);
apiRouter.use('/projects', projectsRoutes);
apiRouter.use('/passport', passportRoutes);
apiRouter.use('/gamification', gamificationRoutes);
apiRouter.use('/community', communityRoutes);
apiRouter.use('/opportunities', opportunitiesRoutes);

// Mount under both /api/v1 and /api for maximum client compatibility
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// 4. Fallback 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ detail: `Route not found: ${req.method} ${req.originalUrl}` });
});

// 5. Global Error Handler
app.use((err, req, res, next) => {
  console.error('Express Error:', err);
  res.status(500).json({ detail: err.message || 'Internal Server Error' });
});

module.exports = app;
