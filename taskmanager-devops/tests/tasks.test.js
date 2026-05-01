const request = require('supertest');
const app = require('../src/app');

describe('Task Manager API', () => {
  let taskId;

  test('POST /tasks - should create a new task', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Test Task', description: 'Test Description' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Task');
    taskId = res.body.id;
  });

  test('POST /tasks - should fail without title', async () => {
    const res = await request(app).post('/tasks').send({ description: 'No title' });
    expect(res.statusCode).toBe(400);
  });

  test('GET /tasks - should return all tasks', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /tasks/:id - should return single task', async () => {
    const res = await request(app).get(`/tasks/${taskId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(taskId);
  });

  test('GET /tasks/:id - should return 404 for non-existent task', async () => {
    const res = await request(app).get('/tasks/999');
    expect(res.statusCode).toBe(404);
  });

  test('DELETE /tasks/:id - should delete a task', async () => {
    const res = await request(app).delete(`/tasks/${taskId}`);
    expect(res.statusCode).toBe(204);
  });

  test('DELETE /tasks/:id - should return 404 for already deleted task', async () => {
    const res = await request(app).delete(`/tasks/${taskId}`);
    expect(res.statusCode).toBe(404);
  });

  test('GET /health - should return UP status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
  });

  test('GET /metrics - should return Prometheus metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('task_total');
    expect(res.text).toContain('app_uptime_seconds');
    expect(res.text).toContain('memory_usage_bytes');
  });

  test('POST /tasks - should handle empty description', async () => {
    const res = await request(app).post('/tasks').send({ title: 'Task 2' });
    expect(res.statusCode).toBe(201);
    expect(res.body.description).toBe('');
  });

  test('GET /tasks - should list multiple tasks', async () => {
    await request(app).post('/tasks').send({ title: 'Task 3' });
    const res = await request(app).get('/tasks');
    expect(res.body.length).toBeGreaterThan(1);
  });

  test('GET /health - should be JSON', async () => {
    const res = await request(app).get('/health');
    expect(res.header['content-type']).toContain('application/json');
  });
});
