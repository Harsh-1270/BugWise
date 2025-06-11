import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register Route
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false,
                message: "All fields are required" 
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ 
                success: false,
                message: "Password must be at least 6 characters long" 
            });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: existingUser.email === email ? "Email already exists" : "Username already exists" 
            });
        }
        
        // Ensure JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables');
            return res.status(500).json({ 
                success: false,
                message: "Server configuration error" 
            });
        }
        
        const hashed = await bcrypt.hash(password, 10);
        
        const user = await User.create({
            username,
            email,
            password: hashed
        });
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email }, 
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ 
            success: false,
            message: "Server error during registration",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: "Email and password are required" 
            });
        }
        
        // Ensure JWT_SECRET exists
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables');
            return res.status(500).json({ 
                success: false,
                message: "Server configuration error" 
            });
        }
        
        const user = await User.findOne({ email });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid email or password" 
            });
        }
        
        const token = jwt.sign(
            { id: user._id, email: user.email }, 
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        return res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            success: false,
            message: "Server error during login",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Google Sign-In Route
router.post('/google-signin', async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ 
                success: false,
                message: "Google token is required" 
            });
        }
        
        // Check required environment variables
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.JWT_SECRET) {
            console.error('Missing required environment variables');
            return res.status(500).json({ 
                success: false,
                message: "Server configuration error" 
            });
        }
        
        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;
        
        // Check if user exists
        let user = await User.findOne({ 
            $or: [{ email }, { googleId }] 
        });
        
        if (!user) {
            // Create new user for Google sign-in
            user = await User.create({
                username: name,
                email,
                googleId,
                profilePicture: picture,
                isGoogleUser: true
            });
        } else if (!user.googleId) {
            // Link existing email account with Google
            user.googleId = googleId;
            user.isGoogleUser = true;
            if (picture) user.profilePicture = picture;
            await user.save();
        }
        
        // Generate JWT token
        const jwtToken = jwt.sign(
            { id: user._id, email: user.email }, 
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        return res.json({
            success: true,
            message: "Google sign-in successful",
            token: jwtToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                isGoogleUser: user.isGoogleUser
            }
        });
    } catch (error) {
        console.error('Google sign-in error:', error);
        return res.status(401).json({ 
            success: false,
            message: "Invalid Google token",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;