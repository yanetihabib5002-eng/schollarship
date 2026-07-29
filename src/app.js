const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');

const env = require('./config/env');
const { getFirebaseApp } = require('./config/firebase');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { limiter } = require('./middleware/rateLimiter');
const path = require('path');

const app = express();

getFirebaseApp();

const isDev = env.nodeEnv === 'development';
app.use(helmet());
app.use(cors({ origin: isDev ? true : env.cors.origin.split(',').map(s => s.trim()), credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(limiter);

app.use('/api/v1', routes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

app.get('/', (_req, res) => {
  res.json({
    message: 'API Gestion Scolaire',
    version: '1.0.0',
    docs: '/api-docs',
  });
});

app.use((_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.use(errorHandler);

module.exports = app;
