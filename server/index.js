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
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:false}))


app.use('/', require('./routes/authRoutes'))
const port = 8000;
app.listen(port, () => console.log (`Server is running on port ${port}`))