const mongoose = require('mongoose');

const bugSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['Critical', 'Major', 'Minor', 'Unknown'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  file: {
    type: String,
    required: true
  },
  filePath: String,
  line: {
    type: Number,
    required: true
  },
  column: Number,
  code: String,
  suggestion: String
}, { _id: false });

const scanResultsSchema = new mongoose.Schema({
  totalBugs: {
    type: Number,
    default: 0
  },
  filesScanned: {
    type: Number,
    default: 0
  },
  severity: {
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  categories: {
    type: Map,
    of: Number,
    default: new Map()
  },
  duration: Number, // in milliseconds
  bugs: [bugSchema],
  timestamp: Date
}, { _id: false });

const scanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  repoUrl: {
    type: String,
    required: true,
    trim: true
  },
  repoName: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'scanning', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  scanType: {
    type: String,
    enum: ['ai-powered', 'pattern-based', 'hybrid'],
    default: 'ai-powered'
  },
  scanResults: scanResultsSchema,
  error: String,
  metadata: {
    userAgent: String,
    ipAddress: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  startedAt: Date,
  scannedAt: Date
});

// Indexes for better query performance
scanSchema.index({ userId: 1, createdAt: -1 });
scanSchema.index({ userId: 1, status: 1 });
scanSchema.index({ repoUrl: 1, userId: 1 });

// Virtual for scan duration
scanSchema.virtual('duration').get(function() {
  if (this.scannedAt && this.startedAt) {
    return this.scannedAt - this.startedAt;
  }
  return null;
});

// Ensure virtual fields are serialized
scanSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Scan', scanSchema);