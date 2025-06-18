const User = require('../models/User')
const {hashPassword, comparePassword} = require('../helpers/auth')
const jwt = require('jsonwebtoken')
const {OAuth2Client} = require('google-auth-library')

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const test = (req, res) => {
    res.json('test is working')
}

// Register Endpoint
const registerUser = async (req,res) => {
    try {
        const {name,email,password} = req.body
        // Check if name was entered
        if(!name){
            return res.json({
                error: 'Name is required'
            })
        };
        // Check is password is good
        if(!password || password.length < 6){
            return res.json({
                error:'Password is required and should be atleast 6 characters long'
            })
        };
        // Check Email
        const exist = await User.findOne({email});
        if(exist) {
            return res.json ({
                error : 'Email is taken already'
            })
        };

        const hashedPassword = await hashPassword(password)
        // Create user in database
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        })

        return res.json(user)
    } catch (error) {
        console.log(error)
    }
}

// Login Endpoint
const loginUser = async (req, res) => {
    try {
        const {email,password} = req.body
        
        //Check if user exists
        const user = await User.findOne({email})
        if(!user){
            return res.json({
                error:"No User found"
            })
        }

        // Check is password match
        const match = await comparePassword(password, user.password)
        if(match){
            jwt.sign({email: user.email, id: user._id, name:user.name}, process.env.JWT_SECRET, {}, (err,token) => {
                if(err) throw err;
                res.cookie('token', token).json(user)
            })
        }
        if(!match){
            res.json({
                error:"Password doesn't match"
            })
        }
    } catch (error) {
        console.log(error)
    }
}

// Google OAuth Login/Signup
const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body
        
        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.VITE_GOOGLE_CLIENT_ID,
        })
        
        const payload = ticket.getPayload()
        const { email, name, picture, sub: googleId } = payload
        
        // Check if user already exists
        let user = await User.findOne({ 
            $or: [
                { email: email },
                { googleId: googleId }
            ]
        })
        
        if (user) {
            // User exists - Login
            // Update googleId if not present
            if (!user.googleId) {
                user.googleId = googleId
                await user.save()
            }
            
            // Generate JWT token
            jwt.sign(
                { email: user.email, id: user._id, name: user.name }, 
                process.env.JWT_SECRET, 
                {}, 
                (err, token) => {
                    if (err) throw err;
                    res.cookie('token', token).json({
                        success: true,
                        user: user,
                        message: 'Login successful'
                    })
                }
            )
        } else {
            // User doesn't exist - Create new user (Signup)
            const newUser = await User.create({
                name: name,
                email: email,
                googleId: googleId,
                profilePicture: picture,
                // No password needed for Google OAuth users
                isGoogleUser: true
            })
            
            // Generate JWT token
            jwt.sign(
                { email: newUser.email, id: newUser._id, name: newUser.name }, 
                process.env.JWT_SECRET, 
                {}, 
                (err, token) => {
                    if (err) throw err;
                    res.cookie('token', token).json({
                        success: true,
                        user: newUser,
                        message: 'Account created and login successful'
                    })
                }
            )
        }
        
    } catch (error) {
        console.log('Google Auth Error:', error)
        res.status(400).json({
            error: 'Google authentication failed'
        })
    }
}

module.exports = {
    test,
    registerUser,
    loginUser,
    googleAuth
}