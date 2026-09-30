const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    service: 'notification-service', 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.post('/notify', async (req, res) => {
  try {
    const { type, order, user } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: 'type is required' });
    }

    // Simple console "notification" and response
    console.log('🔔 Notification received:', { type, orderId: order ? order.id : null, user: user ? user.email : null });
    
    // In real world: send email/SMS/push. Here we just respond success.
    res.json({ status: 'delivered', type, deliveredAt: new Date().toISOString() });
  } catch (error) {
    console.error('Error in notify:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

const PORT = process.env.PORT || 8005;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`📧 Notification Service running on port ${PORT}`);
});
