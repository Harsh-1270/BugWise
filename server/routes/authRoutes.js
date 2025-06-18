const express = require('express')
const router = express.Router()
const cors = require('cors')
const {test, registerUser, loginUser, googleAuth} = require('../controllers/authController')

//middlewares
router.use(
    cors({
        credentials:true,
        origin: 'http://localhost:5173'
    })
)

router.get('/', test)
router.post('/signupform', registerUser)
router.post('/signinform', loginUser)
router.post('/google', googleAuth)

module.exports = router