const express = require('express');
const path = require('path');
const { Registry, collectDefaultMetrics, Counter } = require('prom-client');

const app = express();
app.use(express.json());

// Prometheus Metrics setup
const register = new Registry();
collectDefaultMetrics({ register });

const httpRequestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

// Middleware to track metrics
app.use((req, res, next) => {
  res.on('finish', () => {
    // We try to match a route if possible (excluding static files)
    if (req.path.startsWith('/api') || req.path === '/health' || req.path === '/metrics') {
      const route = req.route ? req.route.path : req.path;
      httpRequestCounter.labels(req.method, route, res.statusCode.toString()).inc();
    }
  });
  next();
});

// In-memory data store
let orders = [];

const drinks = [
  { id: 1, name: "Classic Black Coffee Latte", desc: "Bold, smooth, no frills.", rating: 4 },
  { id: 2, name: "Cafe Frappe", desc: "Chilled, foamy, and refreshingly bold.", rating: 5 },
  { id: 3, name: "Layered Coffee Latte", desc: "Smooth espresso meets silky milk.", rating: 3 }
];

const cookies = [
  { id: 1, name: "Chocolate Chip Cookie", desc: "Crispy edges, chewy center.", rating: 5 },
  { id: 2, name: "Oatmeal Cookie", desc: "Soft, healthy, hint of cinnamon.", rating: 4 },
  { id: 3, name: "Fudgy Brownie", desc: "Rich gooey chocolate brownie.", rating: 5 }
];

// Health and Metrics Routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// API Routes
app.get('/api/drinks', (req, res) => {
  res.status(200).json(drinks);
});

app.get('/api/cookies', (req, res) => {
  res.status(200).json(cookies);
});

app.post('/api/order', (req, res) => {
  const { drinkId, cookieId, customerName } = req.body;
  if (!drinkId || !cookieId || !customerName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const newOrder = {
    orderId: orders.length + 1,
    status: 'confirmed',
    customerName,
    drinkId,
    cookieId
  };
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

app.get('/api/orders', (req, res) => {
  res.status(200).json(orders);
});

// Serve static frontend files
const distPath = path.join(__dirname, '../../dist');
app.use(express.static(distPath));

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Method for test isolation
app.resetOrders = () => {
  orders = [];
};

module.exports = app;
