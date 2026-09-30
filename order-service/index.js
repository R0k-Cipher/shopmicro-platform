const express = require('express');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'orders.json');

async function initDB() {
  try {
    const dir = path.dirname(DB_PATH);
    await fs.mkdir(dir, { recursive: true });
    
    try {
      await fs.access(DB_PATH);
    } catch {
      await fs.writeFile(DB_PATH, JSON.stringify([]));
      console.log('✅ Order database initialized');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

app.get('/health', (req, res) => {
  res.json({ 
    service: 'order-service', 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.post('/', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    
    if (!userId || !productId || !quantity) {
      return res.status(400).json({ 
        error: 'userId, productId, and quantity are required' 
      });
    }
    
    // Verify user exists
    let user;
    try {
      const userResponse = await axios.get(
        `${process.env.USER_SERVICE_URL || 'http://user-service:8001'}/${userId}`
      );
      user = userResponse.data;
    } catch (error) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify product exists and check stock
    let product;
    try {
      const productResponse = await axios.get(
        `${process.env.PRODUCT_SERVICE_URL || 'http://product-service:8002'}/${productId}`
      );
      product = productResponse.data;
    } catch (error) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ 
        error: 'Insufficient stock',
        available: product.stock,
        requested: quantity
      });
    }
    
    // Update stock
    try {
      await axios.patch(
        `${process.env.PRODUCT_SERVICE_URL || 'http://product-service:8002'}/${productId}/stock`,
        { quantity }
      );
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update product stock' });
    }
    
    // Create order
    const data = await fs.readFile(DB_PATH, 'utf8');
    const orders = JSON.parse(data);
    
    const newOrder = {
      id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
      userId: parseInt(userId),
      productId: parseInt(productId),
      quantity: parseInt(quantity),
      total: product.price * quantity,
      status: 'confirmed',
      userEmail: user.email,
      productName: product.name,
      createdAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    await fs.writeFile(DB_PATH, JSON.stringify(orders, null, 2));
    
    // Send notification
    try {
      await axios.post(
        `${process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:8005'}/notify`,
        {
          type: 'ORDER_CREATED',
          order: newOrder,
          user: user
        }
      );
    } catch (notifyError) {
      console.log('⚠️ Notification service unavailable, continuing...');
    }
    
    console.log(`✅ New order created: #${newOrder.id} for ${user.email}`);
    res.status(201).json(newOrder);
    
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    const orders = JSON.parse(data);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/:id', async (req, res) => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    const orders = JSON.parse(data);
    const order = orders.find(o => o.id == req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

const PORT = process.env.PORT || 8003;
initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`📋 Order Service running on port ${PORT}`);
  });
});
