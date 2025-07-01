const request = require('supertest');
const app = require('../app');

describe('GetHelp API', () => {
  test('GET /health should return OK status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET /api/health should return detailed health check', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET /api/tasks/list should return available tasks', async () => {
    const response = await request(app)
      .get('/api/tasks/list')
      .expect(200);
    
    expect(response.body).toHaveProperty('availableTasks');
    expect(Array.isArray(response.body.availableTasks)).toBe(true);
    expect(response.body.availableTasks.length).toBe(6);
  });

  test('POST /api/tasks/execute should execute a task', async () => {
    const response = await request(app)
      .post('/api/tasks/execute')
      .send({
        taskType: 'account_info',
        parameters: {}
      })
      .expect(200);
    
    expect(response.body).toHaveProperty('taskType', 'account_info');
    expect(response.body).toHaveProperty('result');
    expect(response.body.result).toHaveProperty('success', true);
  });

  test('POST /api/auth/login should authenticate demo user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'demo',
        password: 'demo123'
      })
      .expect(200);
    
    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });
});