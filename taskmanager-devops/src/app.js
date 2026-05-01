/* eslint-env node */
const express = require('express');
const app = express();

app.use(express.json());

let tasks = [];
let nextId = 1;

// Metrics tracking
const startTime = Date.now();

// CRUD Endpoints
app.post('/tasks', (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const task = { id: nextId++, title, description: description || '', completed: false };
  tasks.push(task);
  res.status(201).json(task);
});

app.get('/tasks', (req, res) => {
  res.json(tasks);
});

app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  tasks.splice(index, 1);
  res.status(204).send();
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

// Metrics Endpoint (Prometheus format)
app.get('/metrics', (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const memoryUsage = process.memoryUsage().rss;
  
  let metrics = '';
  metrics += `task_total ${tasks.length}\n`;
  metrics += `app_uptime_seconds ${uptime}\n`;
  metrics += `memory_usage_bytes ${memoryUsage}\n`;
  
  res.set('Content-Type', 'text/plain');
  res.send(metrics);
});

// Info Endpoint (New Change)
app.get('/info', (req, res) => {
  res.json({
    name: 'Task Manager DevOps',
    version: '1.1.0',
    description: 'Updated via Live Pipeline'
  });
});

module.exports = app;
