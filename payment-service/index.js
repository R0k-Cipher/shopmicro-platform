const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'payments.json');

async function initDB() {
  try {
    const dir = path.dirname(DB_PATH);
    await fs.mkdir(dir, { recursive: true });
    
    try {
      await fs.access(DB_PATH);
    } catch {
      await fs.writeFile(DB_PATH, JSON.stringify([]));
      console.log('✅ Payment database initialized');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

app.get('/health', (req, res) => {
  res.json({ 
    service: 'payment-service', 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.post('/process', async (req, res) => {
  try {
    const { orderId, amount, paymentMethod = 'credit_card' } = req.body;
    
    if (!orderId || !amount) {
      return res.status(400).json({ 
        error: 'orderId and amount are required' 
      });
    }
    
    const data = await fs.readFile(DB_PATH, 'utf8');
    const payments = JSON.parse(data);
    
    // Simulate payment processing (90% success rate)
    const isSuccess = Math.random() > 0.1;
    const paymentStatus = isSuccess ? 'completed' : 'failed';
    
    const payment = {
      id: payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1,
      orderId: parseInt(orderId),
      amount: parseFloat(amount),
      paymentMethod,
      status: paymentStatus,
      transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      processedAt: new Date().toISOString()
    };
    
    payments.push(payment);
    await fs.writeFile(DB_PATH, JSON.stringify(payments, null, 2));
    
    console.log(`💳 Payment ${paymentStatus}: ${payment.transactionId} for order #${orderId}`);
    
    res.json(payment);
    
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

app.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    const payments = JSON.parse(data);
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

const PORT = process.env.PORT || 8004;
initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`💳 Payment Service running on port ${PORT}`);
  });
});
