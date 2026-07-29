const app = require('./app');
const env = require('./config/env');

const server = app.listen(env.port, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur http://0.0.0.0:${env.port}`);
  console.log(`📚 Documentation API : http://localhost:${env.port}/api-docs`);
  console.log(`🏥 Health check : http://localhost:${env.port}/api/v1/health`);
  console.log(`🌍 Environnement : ${env.nodeEnv}`);
});

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[UNCAUGHT EXCEPTION]', error);
  process.exit(1);
});

module.exports = server;
