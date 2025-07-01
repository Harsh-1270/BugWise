const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: function() {
            return !this.isGoogleUser; // Password not required for Google users
        },
        minlength: 6
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null values
    },
    profilePicture: {
        type: String,
        default: null
    },
    isGoogleUser: {
        type: Boolean,
        default: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    // Additional fields for enhanced profile functionality
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationExpires: {
        type: Date
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to handle lastLogin
userSchema.pre('save', function(next) {
    // Only update lastLogin if it's not a new document and specific fields changed
    if (!this.isNew && this.isModified('updatedAt')) {
        this.lastLogin = new Date();
    }
    next();
});

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: {
                loginAttempts: 1,
                lockUntil: 1
            }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = {
            lockUntil: Date.now() + (2 * 60 * 60 * 1000) // 2 hours
        };
    }
    
    return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: {
            loginAttempts: 1,
            lockUntil: 1
        },
        $set: {
            lastLogin: new Date()
        }
    });
};

// Index for performance

userSchema.index({ resetPasswordToken: 1 });
userSchema.index({ emailVerificationToken: 1 });

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;