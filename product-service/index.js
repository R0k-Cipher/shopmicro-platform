const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'products.json');

async function initDB() {
  try {
    const dir = path.dirname(DB_PATH);
    await fs.mkdir(dir, { recursive: true });
    
    try {
      await fs.access(DB_PATH);
    } catch {
      const initialProducts = [
        { id: 1, name: 'Laptop Gaming', price: 1299, stock: 15, category: 'electronics', description: 'High-performance gaming laptop' },
        { id: 2, name: 'Smartphone', price: 699, stock: 30, category: 'electronics', description: 'Latest smartphone model' },
        { id: 3, name: 'Headphones', price: 199, stock: 50, category: 'electronics', description: 'Noise-cancelling headphones' },
        { id: 4, name: 'Desk Chair', price: 299, stock: 20, category: 'furniture', description: 'Ergonomic office chair' },
        { id: 5, name: 'Coffee Maker', price: 89, stock: 35, category: 'home', description: 'Automatic coffee machine' }
      ];
      await fs.writeFile(DB_PATH, JSON.stringify(initialProducts, null, 2));
      console.log('✅ Product database initialized');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

app.get('/health', (req, res) => {
  res.json({ 
    service: 'product-service', 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    const products = JSON.parse(data);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/:id', async (req, res) => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    const products = JSON.parse(data);
    const product = products.find(p => p.id == req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

app.patch('/:id/stock', async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (typeof quantity !== 'number' || quantity <= 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }
    
    const data = await fs.readFile(DB_PATH, 'utf8');
    const products = JSON.parse(data);
    const product = products.find(p => p.id == req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ 
        error: 'Insufficient stock',
        available: product.stock,
        requested: quantity
      });
    }
    
    product.stock -= quantity;
    await fs.writeFile(DB_PATH, JSON.stringify(products, null, 2));
    
    console.log(`📦 Stock updated: ${product.name} -${quantity} units`);
    res.json(product);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

const PORT = process.env.PORT || 8002;
initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`📦 Product Service running on port ${PORT}`);
  });
});
