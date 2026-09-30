const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'users.json');

// Initialize database
async function initDB() {
  try {
    const dir = path.dirname(DB_PATH);
    await fs.mkdir(dir, { recursive: true });
    
    try {
      await fs.access(DB_PATH);
    } catch {
      // Create initial users
      const initialUsers = [
        { 
          id: 1, 
          email: "admin@shopmicro.com", 
          name: "Admin User",
          createdAt: new Date().toISOString()
        }
      ];
      await fs.writeFile(DB_PATH, JSON.stringify(initialUsers, null, 2));
      console.log('✅ User database initialized');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    service: 'user-service', 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Get all users
app.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    const users = JSON.parse(data);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Register new user
app.post('/register', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }
    
    const data = await fs.readFile(DB_PATH, 'utf8');
    const users = JSON.parse(data);
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      email,
      name,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    await fs.writeFile(DB_PATH, JSON.stringify(users, null, 2));
    
    console.log(`✅ New user registered: ${email}`);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get user by ID
app.get('/:id', async (req, res) => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    const users = JSON.parse(data);
    const user = users.find(u => u.id == req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

const PORT = process.env.PORT || 8001;

initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`👥 User Service running on port ${PORT}`);
  });
});
