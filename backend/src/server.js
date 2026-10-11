import { env } from './config/env.js';
import { testConnection } from './config/database.js';
import app from './app.js';

async function start() {
  try {
    await testConnection();
    console.log('Database connection OK');
  } catch (err) {
    console.error('Could not connect to the database:', err.code || err.message);
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`API running on http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

start();