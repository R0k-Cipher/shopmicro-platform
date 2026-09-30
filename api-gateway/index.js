const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: [
      { name: 'api-gateway', status: 'healthy' },
      { name: 'user-service', url: process.env.USER_SERVICE_URL },
      { name: 'product-service', url: process.env.PRODUCT_SERVICE_URL },
      { name: 'order-service', url: process.env.ORDER_SERVICE_URL },
      { name: 'payment-service', url: process.env.PAYMENT_SERVICE_URL },
      { name: 'notification-service', url: process.env.NOTIFICATION_SERVICE_URL }
    ]
  });
});

// Service routes with proxy
app.use('/api/users', createProxyMiddleware({
  target: process.env.USER_SERVICE_URL || 'http://user-service:8001',
  changeOrigin: true,
  pathRewrite: { '^/api/users': '' },
  onError: (err, req, res) => {
    console.error('User Service Error:', err.message);
    res.status(503).json({ error: 'User Service unavailable' });
  }
}));

app.use('/api/products', createProxyMiddleware({
  target: process.env.PRODUCT_SERVICE_URL || 'http://product-service:8002',
  changeOrigin: true,
  pathRewrite: { '^/api/products': '' },
  onError: (err, req, res) => {
    console.error('Product Service Error:', err.message);
    res.status(503).json({ error: 'Product Service unavailable' });
  }
}));

app.use('/api/orders', createProxyMiddleware({
  target: process.env.ORDER_SERVICE_URL || 'http://order-service:8003',
  changeOrigin: true,
  pathRewrite: { '^/api/orders': '' },
  onError: (err, req, res) => {
    console.error('Order Service Error:', err.message);
    res.status(503).json({ error: 'Order Service unavailable' });
  }
}));

app.use('/api/payments', createProxyMiddleware({
  target: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:8004',
  changeOrigin: true,
  pathRewrite: { '^/api/payments': '' },
  onError: (err, req, res) => {
    console.error('Payment Service Error:', err.message);
    res.status(503).json({ error: 'Payment Service unavailable' });
  }
}));

// Documentation route
app.get('/', (req, res) => {
  res.json({
    message: '🏪 ShopMicro API Gateway',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      products: '/api/products',
      orders: '/api/orders',
      payments: '/api/payments',
      health: '/health'
    },
    examples: {
      createUser: 'POST /api/users/register',
      listProducts: 'GET /api/products',
      createOrder: 'POST /api/orders'
    }
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
