// models/Scan.js
const mongoose = require('mongoose');

const ScanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  repoUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/.test(v);
      },
      message: 'Please provide a valid GitHub repository URL'
    }
  },
  repoName: {
    type: String,
    required: true
  },
  // Main scan results that match your frontend expectations
  scanResults: {
    totalBugs: {
      type: Number,
      default: 0
    },
    filesScanned: {
      type: Number,
      default: 0
    },
    scanDuration: {
      type: Number,
      default: 0
    },
    // For the bar chart - bugs per file
    bugsByFile: [{
      file: String,
      bugs: Number
    }],
    // For the pie chart - bugs by severity
    bugsBySeverity: [{
      name: String,
      value: Number,
      color: String
    }],
    // For the detailed table
    detailedBugs: [{
      id: Number,
      file: String,
      line: Number,
      description: String,
      severity: {
        type: String,
        enum: ['Critical', 'Major', 'Minor', 'Info']
      },
      ruleId: String,
      code: String
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'scanning', 'completed', 'failed'],
    default: 'pending'
  },
  currentScanFile: {
    type: String,
    default: ''
  },
  bugsFoundSoFar: {
    type: Number,
    default: 0
  },
  error: {
    type: String,
    default: null
  },
  scannedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
ScanSchema.index({ userId: 1, createdAt: -1 });
ScanSchema.index({ status: 1 });

module.exports = mongoose.model('Scan', ScanSchema);