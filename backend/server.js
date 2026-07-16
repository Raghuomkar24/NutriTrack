const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const seedDatabase = require('./src/config/seed');

// Load environment variables
dotenv.config();

// Connect to database and seed
connectDB().then(() => {
  seedDatabase();
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/profile', require('./src/routes/profile'));
app.use('/api/meals', require('./src/routes/meals'));
app.use('/api/foods', require('./src/routes/foods'));
app.use('/api', require('./src/routes/tracking')); // /api/water and /api/dashboard/summary
app.use('/api/ai', require('./src/routes/ai'));
app.use('/api/reports', require('./src/routes/reports'));
app.use('/api/recipes', require('./src/routes/recipes'));
app.use('/api/shopping-list', require('./src/routes/shoppingList'));

const PORT = process.env.PORT || 8085;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
