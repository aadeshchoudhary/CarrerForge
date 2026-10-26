const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const app = require('../src/app');

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

async function apiRequest(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

test('Health check endpoint returns healthy', async () => {
  const res = await apiRequest('/health');
  assert.equal(res.status, 200);
  assert.equal(res.data.status, 'healthy');
});

test('Auth: Register new user', async () => {
  const payload = {
    email: 'newstudent@college.edu',
    password: 'password123',
    full_name: 'Pooja Verma',
    handle: 'pooja_v',
    target_role: 'Data Analyst',
  };
  const res = await apiRequest('/api/v1/auth/register', { method: 'POST', body: payload });
  assert.equal(res.status, 201);
  assert.ok(res.data.access_token);
  assert.equal(res.data.handle, '@pooja_v');
});

test('Auth: Login demo user', async () => {
  const res = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email: 'aarav.sharma@college.edu', password: 'strongPassword123' },
  });
  assert.equal(res.status, 200);
  assert.ok(res.data.access_token);
  assert.equal(res.data.handle, '@aarav_sharma');
});

test('Profile: Get current user profile', async () => {
  const res = await apiRequest('/api/v1/profile/me');
  assert.equal(res.status, 200);
  assert.ok(res.data.career_id);
  assert.ok(res.data.skills.length > 0);
});

test('Skills: Get sample jobs and analyze skill gap', async () => {
  const jobsRes = await apiRequest('/api/v1/skills/jobs/sample');
  assert.equal(jobsRes.status, 200);
  assert.ok(jobsRes.data.length >= 4);

  const gapRes = await apiRequest('/api/v1/skills/analyze-gap', {
    method: 'POST',
    body: { job_id: 'job-1' },
  });
  assert.equal(gapRes.status, 201);
  assert.ok(gapRes.data.coverage_score > 0);
  assert.ok(gapRes.data.formula_breakdown);
});

test('Dashboard: Get dashboard summary', async () => {
  const res = await apiRequest('/api/v1/dashboard/summary');
  assert.equal(res.status, 200);
  assert.ok(res.data.readiness);
  assert.ok(res.data.active_quests.length > 0);
});

test('Resume Builder: Quality check ATS score', async () => {
  const res = await apiRequest('/api/v1/resume-builder/quality-check', {
    method: 'POST',
    body: {
      skills: ['React', 'Express', 'JavaScript', 'PostgreSQL', 'Docker', 'Git'],
      work_experience: [{ title: 'Intern', company: 'Tech', duration: '3 mo', bullet_points: ['Built APIs'] }],
      projects: [{ title: 'E-Commerce', tech_stack: 'React, Express', description: 'Store' }],
    },
  });
  assert.equal(res.status, 200);
  assert.ok(res.data.quality_score >= 80);
});

test('Career Finder: Explore role comparisons', async () => {
  const res = await apiRequest('/api/v1/career-finder/explore');
  assert.equal(res.status, 200);
  assert.ok(res.data.length >= 4);
});

test('Roadmap: Active roadmap & milestone toggle', async () => {
  const res = await apiRequest('/api/v1/roadmap/active');
  assert.equal(res.status, 200);
  assert.ok(res.data.items.length >= 6);

  const toggleRes = await apiRequest('/api/v1/roadmap/items/m-1/toggle', { method: 'PUT' });
  assert.equal(toggleRes.status, 200);
  assert.ok(toggleRes.data.status);
});

test('Tracker: Summary, Goals, and Study Logging', async () => {
  const sumRes = await apiRequest('/api/v1/tracker/summary');
  assert.equal(sumRes.status, 200);
  assert.ok(sumRes.data.consecutive_days_streak >= 7);

  const logRes = await apiRequest('/api/v1/tracker/log-study', {
    method: 'POST',
    body: { topic: 'Express Middleware', hours_spent: 2.0 },
  });
  assert.equal(logRes.status, 201);
  assert.equal(logRes.data.hours_spent, 2.0);
});

test('Projects: Catalog & Proof Submission', async () => {
  const catRes = await apiRequest('/api/v1/projects/catalog');
  assert.equal(catRes.status, 200);
  assert.ok(catRes.data.length >= 2);

  const subRes = await apiRequest('/api/v1/projects/submit', {
    method: 'POST',
    body: {
      title: 'Full Stack Express SaaS',
      github_url: 'https://github.com/aadeshchoudhary/express-saas',
      description: 'Production API with JWT',
      skills_demonstrated: ['Express', 'Node.js', 'PostgreSQL'],
    },
  });
  assert.equal(subRes.status, 201);
  assert.equal(subRes.data.verification_status, 'verified');
});

test('Passport: Get passport with SHA-256 hash', async () => {
  const res = await apiRequest('/api/v1/passport/me');
  assert.equal(res.status, 200);
  assert.ok(res.data.verification_hash);
});

test('Gamification: Badges & Leaderboard', async () => {
  const badgesRes = await apiRequest('/api/v1/gamification/badges');
  assert.equal(badgesRes.status, 200);
  assert.ok(badgesRes.data.length >= 6);

  const leadRes = await apiRequest('/api/v1/gamification/leaderboard');
  assert.equal(leadRes.status, 200);
  assert.ok(leadRes.data.rankings.length >= 5);
});

test('Community: Feed, Post creation, Like toggle, and Stats', async () => {
  const feedRes = await apiRequest('/api/v1/community/feed');
  assert.equal(feedRes.status, 200);
  assert.ok(feedRes.data.length >= 2);

  const postRes = await apiRequest('/api/v1/community/posts', {
    method: 'POST',
    body: { title: 'Express Migration Complete', content: 'Migrated successfully to Node Express!', topic: 'Web Dev' },
  });
  assert.equal(postRes.status, 201);

  const likeRes = await apiRequest(`/api/v1/community/posts/${postRes.data.id}/like`, { method: 'POST' });
  assert.equal(likeRes.status, 200);
  assert.equal(likeRes.data.has_liked, true);
});

test('Opportunities: Applications, Interview Evaluation, and Trends', async () => {
  const appsRes = await apiRequest('/api/v1/opportunities/applications');
  assert.equal(appsRes.status, 200);
  assert.ok(appsRes.data.length >= 4);

  const evalRes = await apiRequest('/api/v1/opportunities/interview/evaluate', {
    method: 'POST',
    body: {
      role_title: 'Full Stack Developer',
      interview_type: 'technical',
      question_text: 'Explain event loop and async/await in Node.js',
      user_answer: 'In Node.js, asynchronous operations utilize the event loop and thread pool for non-blocking I/O. Async/await syntax provides cleaner promise resolution.',
    },
  });
  assert.equal(evalRes.status, 200);
  assert.ok(evalRes.data.ai_score >= 70);

  const trendsRes = await apiRequest('/api/v1/opportunities/trends');
  assert.equal(trendsRes.status, 200);
  assert.ok(trendsRes.data.length >= 5);
});
