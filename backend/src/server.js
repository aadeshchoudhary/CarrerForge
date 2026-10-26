const app = require('./app');
const config = require('./config');

const server = app.listen(config.PORT, () => {
  console.log(`========================================================`);
  console.log(`🚀 CareerForge AI — Express.js Backend is LIVE!`);
  console.log(`📡 URL: http://127.0.0.1:${config.PORT}`);
  console.log(`🩺 Health: http://127.0.0.1:${config.PORT}/health`);
  console.log(`📚 API V1: http://127.0.0.1:${config.PORT}/api/v1`);
  console.log(`========================================================`);
});

module.exports = server;
