const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
dotenv.config() 
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const app = express()


//database connection
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('Database Connected'))
.catch((err) => console.log('Database not Connected', err))

//middlewares
app.use(cors({
  origin: 'http://localhost:5173', // frontend origin
  credentials: true
}));

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:false}))


app.use('/', require('./routes/authRoutes'))
app.use('/api/scan', require('./routes/scan'));
app.use('/api/profile', require('./routes/profile'));
app.get('/test-cors', (req, res) => {
  res.json({ message: 'CORS is working' });
});

const port = 8000;
app.listen(port, () => console.log (`Server is running on port ${port}`))





