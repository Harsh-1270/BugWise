// index.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

dotenv.config();
const app = express();

/* ——————————————————— 1. DB connection ——————————————————— */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('Database Connected'))
  .catch(err => console.log('Database not Connected', err));

/* ——————————————————— 2. CORS setup ——————————————————— */
const allowedOrigins = [
  'http://localhost:5173',              // local dev
  'https://bugwise-client.onrender.com' // production front‑end
];

const corsOptions = {
  origin(origin, cb) {
    // allow requests with no Origin header (e.g. Postman, server‑to‑server)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS blocked: origin not allowed'));
  },
  credentials: true,                    // <── adds Access-Control-Allow-Credentials: true
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept'
  ]
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));     // <── answers every pre‑flight

/* ——————————————————— 3. Body parsers ——————————————————— */
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

/* ——————————————————— 4. Routes ——————————————————— */
app.use('/', require('./routes/authRoutes'));
app.use('/api/scan', require('./routes/scan'));
app.use('/api/profile', require('./routes/profile'));

/* Simple health‑check */
app.get('/test-cors', (_req, res) => {
  res.json({ message: 'CORS is working 🎉' });
});

/* ——————————————————— 5. Start server ——————————————————— */
const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
