// routes/scan.js
const express = require('express');
const router = express.Router();
const Scan = require('../models/Scan');
const { startScan } = require('../services/scanService');
const auth = require('../middleware/auth');


// POST /api/scan - Start a new repository scan
router.post('/', auth, async (req, res) => {
  try {
    const { repoUrl } = req.body;
    const userId = req.user.id; // From your auth middleware

    // Validate GitHub URL
    const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;
    if (!githubRegex.test(repoUrl)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid GitHub repository URL' 
      });
    }

    // Extract repository name
    const repoName = repoUrl.replace('https://github.com/', '').replace(/\/$/, '');

    // Check if user has a recent scan of the same repo (optional rate limiting)
    const recentScan = await Scan.findOne({
      userId,
      repoUrl,
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } // 10 minutes
    });

    if (recentScan) {
      return res.status(429).json({
        success: false,
        message: 'Please wait before scanning the same repository again',
        nextScanAllowed: new Date(recentScan.createdAt.getTime() + 10 * 60 * 1000)
      });
    }

    // Create new scan record
    const scan = new Scan({
      userId,
      repoUrl,
      repoName,
      status: 'pending'
    });

    await scan.save();

    // Start background scanning process
    startScan(scan._id)
      .then(() => {
        console.log(`Scan completed for ${repoUrl}`);
      })
      .catch((error) => {
        console.error(`Scan failed for ${repoUrl}:`, error);
      });

    res.json({
      success: true,
      message: 'Scan initiated successfully',
      scanId: scan._id,
      status: 'pending'
    });

  } catch (error) {
    console.error('Scan initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/scan/status/:scanId - Get scan status and results
router.get('/status/:scanId', auth, async (req, res) => {
  try {
    const { scanId } = req.params;
    const userId = req.user.id;

    const scan = await Scan.findOne({ _id: scanId, userId });
    
    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found'
      });
    }

    // Return response based on scan status
    const response = {
      success: true,
      scanId: scan._id,
      status: scan.status,
      repoUrl: scan.repoUrl,
      repoName: scan.repoName,
      scannedAt: scan.scannedAt
    };

    // Add scanning progress info
    if (scan.status === 'scanning') {
      response.currentScanFile = scan.currentScanFile;
      response.bugsFoundSoFar = scan.bugsFoundSoFar;
    }

    // Add results if completed
    if (scan.status === 'completed' && scan.scanResults) {
      response.scanResults = scan.scanResults;
    }

    // Add error if failed
    if (scan.status === 'failed') {
      response.error = scan.error;
    }

    res.json(response);

  } catch (error) {
    console.error('Get scan status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/scan/history - Get user's scan history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const scans = await Scan.find({ userId })
      .select('repoUrl repoName status scanResults.totalBugs scannedAt createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Scan.countDocuments({ userId });

    res.json({
      success: true,
      scans: scans.map(scan => ({
        scanId: scan._id,
        repoUrl: scan.repoUrl,
        repoName: scan.repoName,
        status: scan.status,
        totalBugs: scan.scanResults?.totalBugs || 0,
        scannedAt: scan.scannedAt,
        createdAt: scan.createdAt
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalScans: total
      }
    });

  } catch (error) {
    console.error('Get scan history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/scan/details/:scanId - Get detailed scan results (for the table)
router.get('/details/:scanId', auth, async (req, res) => {
  try {
    const { scanId } = req.params;
    const userId = req.user.id;

    const scan = await Scan.findOne({ _id: scanId, userId });
    
    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found'
      });
    }

    if (scan.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Scan not completed yet'
      });
    }

    res.json({
      success: true,
      scanId: scan._id,
      repoName: scan.repoName,
      repoUrl: scan.repoUrl,
      scannedAt: scan.scannedAt,
      scanResults: scan.scanResults
    });

  } catch (error) {
    console.error('Get scan details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/scan/:scanId - Delete a scan
router.delete('/:scanId', auth, async (req, res) => {
  try {
    const { scanId } = req.params;
    const userId = req.user.id;

    const result = await Scan.deleteOne({ _id: scanId, userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found'
      });
    }

    res.json({
      success: true,
      message: 'Scan deleted successfully'
    });

  } catch (error) {
    console.error('Delete scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;