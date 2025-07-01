const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

router.get('/detailed', async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    openai: await checkOpenAI(),
  };
  
  const allHealthy = Object.values(checks).every(check => check.status === 'OK');
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'OK' : 'DEGRADED',
    checks,
    timestamp: new Date().toISOString(),
  });
});

async function checkDatabase() {
  try {
    // Mock database check - replace with actual database ping
    return { status: 'OK', message: 'Database connection healthy' };
  } catch (error) {
    return { status: 'ERROR', message: error.message };
  }
}

async function checkRedis() {
  try {
    // Mock Redis check - replace with actual Redis ping
    return { status: 'OK', message: 'Redis connection healthy' };
  } catch (error) {
    return { status: 'ERROR', message: error.message };
  }
}

async function checkOpenAI() {
  try {
    // Mock OpenAI check - replace with actual API test
    return { status: 'OK', message: 'OpenAI API accessible' };
  } catch (error) {
    return { status: 'ERROR', message: error.message };
  }
}

module.exports = router;