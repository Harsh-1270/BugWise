const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const User = require('../models/User');


// Rate limiting for sensitive operations
const profileUpdateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each user to 10 profile updates per windowMs
  message: 'Too many profile update attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordChangeLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each user to 3 password change attempts per windowMs
  message: 'Too many password change attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// GET /api/profile - Get user profile data
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Format response to match frontend expectations
    const profileData = {
      name: user.name,
      email: user.email,
      joinDate: user.createdAt.toISOString().split('T')[0], // Format as YYYY-MM-DD
      lastLogin: user.updatedAt.toISOString(), // Using updatedAt as lastLogin approximation
      tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      avatar: user.profilePicture,
      isGoogleUser: user.isGoogleUser,
      isEmailVerified: user.isEmailVerified
    };

    res.json({
      success: true,
      message: 'Profile data retrieved successfully',
      data: profileData
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/profile - Update user profile
router.put('/', auth, profileUpdateLimit, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 3 and 30 characters'
      });
    }

    // Check if name is already taken by another user
    const existingUser = await User.findOne({
      name: name.trim(),
      _id: { $ne: userId }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: name.trim(),
        ...(email && { email: email.toLowerCase().trim() })
      },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Format response
    const profileData = {
      name: updatedUser.name,
      email: updatedUser.email,
      joinDate: updatedUser.createdAt.toISOString().split('T')[0],
      lastLogin: updatedUser.updatedAt.toISOString(),
      tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      avatar: updatedUser.profilePicture,
      isGoogleUser: updatedUser.isGoogleUser,
      isEmailVerified: updatedUser.isEmailVerified
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: profileData
    });

  } catch (error) {
    console.error('Error updating profile:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)[0].message
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} is already taken`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/profile/password - Change password
router.put('/password', auth, passwordChangeLimit, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All password fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is Google user
    if (user.isGoogleUser && !user.password) {
      return res.status(400).json({
        success: false,
        message: 'Google users cannot change password. Please use Google account settings.'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/profile - Delete user account
router.delete('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { confirmPassword } = req.body;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // For non-Google users, verify password
    if (!user.isGoogleUser && user.password) {
      if (!confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Password confirmation required to delete account'
        });
      }

      const isPasswordValid = await bcrypt.compare(confirmPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect password'
        });
      }
    }

    // Delete user account
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});



module.exports = router;