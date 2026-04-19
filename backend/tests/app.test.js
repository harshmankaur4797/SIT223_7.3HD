const request = require('supertest');
const app = require('../src/app');

describe('Backend API Tests', () => {
  beforeEach(() => {
    app.resetOrders();
  });

  test('1. GET /health returns 200 and status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('2. GET /api/drinks returns 200 and array of length 3', async () => {
    const res = await request(app).get('/api/drinks');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
  });

  test('3. GET /api/drinks first item has correct name', async () => {
    const res = await request(app).get('/api/drinks');
    expect(res.body[0].name).toBe('Classic Black Coffee Latte');
  });

  test('4. GET /api/cookies returns 200 and array of length 3', async () => {
    const res = await request(app).get('/api/cookies');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(3);
  });

  test('5. GET /api/orders returns 200 and empty array initially', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('6. POST /api/order with valid body returns 201 and confirmed status', async () => {
    const res = await request(app)
      .post('/api/order')
      .send({ drinkId: 1, cookieId: 1, customerName: 'John' });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('confirmed');
    expect(res.body.customerName).toBe('John');
  });

  test('7. POST /api/order missing customerName returns 400', async () => {
    const res = await request(app)
      .post('/api/order')
      .send({ drinkId: 1, cookieId: 1 });
    expect(res.statusCode).toBe(400);
  });

  test('8. POST /api/order missing drinkId returns 400', async () => {
    const res = await request(app)
      .post('/api/order')
      .send({ cookieId: 1, customerName: 'John' });
    expect(res.statusCode).toBe(400);
  });

  test('9. After POST /api/order succeeds, GET /api/orders returns length 1', async () => {
    await request(app)
      .post('/api/order')
      .send({ drinkId: 1, cookieId: 1, customerName: 'John' });
    const res = await request(app).get('/api/orders');
    expect(res.body.length).toBe(1);
  });

  test('10. GET /metrics returns 200', async () => {
    const res = await request(app).get('/metrics');
    expect(res.statusCode).toBe(200);
  });
});
