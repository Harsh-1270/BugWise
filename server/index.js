import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
require('dotenv').config();

import authRoutes from './routes/authRoutes.js';
import bugRoutes from './routes/bugRoutes.js';

dotenv.config();
const app = express();

// ✅ Fix: Use parentheses, not dash
app.use(cors());
app.use(express.json()); // ← Fixed syntax: was `app.use - express.json();`

// ✅ Routing
app.use('/api/auth', authRoutes);
app.use('/api/bugs', bugRoutes);

// ✅ Fix: Typo in "process.env" (was "proxess.env")
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('✅ Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Error connecting to MongoDB:', err);
    });
