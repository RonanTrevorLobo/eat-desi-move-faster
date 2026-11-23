import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import recipeRoutes from './routes/recipes.js';
import favouriteRoutes from './routes/favourites.js';
import groceryRoutes from './routes/grocery.js';
import planRoutes from './routes/plans.js';
import chatRoutes from './routes/chat.js';

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error('Missing MONGO_URI or JWT_SECRET. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const app = express();
// CLIENT_URL can hold several addresses separated by commas (local site + deployed site)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '3mb' })); // recipe photos are sent as base64 text

app.get('/api/health', (req, res) => res.json({ status: 'up' }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/favourites', favouriteRoutes);
app.use('/api/grocery', groceryRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/chat', chatRoutes);

// Unknown URL
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Any error thrown inside a route lands here
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  });
