const User = require('../models/User');
const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Basic test route
const test = (req, res) => {
  res.json('✅ Auth route is working');
};

// Register Endpoint
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        error: 'Password is required and should be at least 6 characters',
      });
    }

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(409).json({ error: 'Email is already in use' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Login Endpoint
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'No user found with that email' });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { email: user.email, id: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Optional: expire in 7 days
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in prod
      sameSite: 'Lax',
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};
// Google OAuth Login/Signup - Updated to handle user data from frontend
const googleAuth = async (req, res) => {
  try {
    const { googleId, name, email, picture, access_token } = req.body;

    console.log('Received Google auth data:', { googleId, name, email, picture }); // Debug log

    // Validate required fields
    if (!googleId || !name || !email) {
      return res.status(400).json({ error: 'Missing required Google user data' });
    }

    // Check if user exists by email or googleId
    let user = await User.findOne({
      $or: [{ email }, { googleId }],
    });

    if (!user) {
      // Create new Google user
      user = await User.create({
        name,
        email,
        googleId,
        profilePicture: picture,
        isGoogleUser: true,
        // Note: No password field for Google users
      });
      console.log('Created new Google user:', user._id);
    } else {
      // Update existing user with Google data if needed
      let updateNeeded = false;
      
      if (!user.googleId) {
        user.googleId = googleId;
        updateNeeded = true;
      }
      
      if (!user.profilePicture && picture) {
        user.profilePicture = picture;
        updateNeeded = true;
      }
      
      if (!user.isGoogleUser) {
        user.isGoogleUser = true;
        updateNeeded = true;
      }
      
      if (updateNeeded) {
        await user.save();
        console.log('Updated existing user with Google data:', user._id);
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, id: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.profilePicture,
      },
      token,
      message: 'Google authentication successful',
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
};

module.exports = {
  test,
  registerUser,
  loginUser,
  googleAuth,
};