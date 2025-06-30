  const express = require('express');
  const router = express.Router();
  const Scan = require('../models/Scan');
  const { scanRepository, startScan } = require('../services/aiScanService');
  const auth = require('../middleware/auth');
  const rateLimit = require('express-rate-limit');
  const mongoose = require('mongoose');

  // GitHub URL validation pattern
  const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;

  // Rate limiting for scan endpoints
  const scanRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each user to 5 scan requests per windowMs
    message: 'Too many scan requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  // POST /api/scan - Start an AI-powered scan
 router.post('/', auth, scanRateLimit, async (req, res) => {
  try {
    const { repoUrl } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!repoUrl || typeof repoUrl !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Repository URL is required' 
      });
    }

    if (!githubRegex.test(repoUrl)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid GitHub repository URL. Please provide a valid public GitHub repository URL.' 
      });
    }

    const repoName = repoUrl.replace('https://github.com/', '').replace(/\/$/, '');

    // Enhanced rate limit - 10 minutes per repo per user
    const recentScan = await Scan.findOne({
      userId,
      repoUrl,
      createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) }
    });

    if (recentScan) {
      const nextScanTime = new Date(recentScan.createdAt.getTime() + 10 * 60 * 1000);
      return res.status(429).json({
        success: false,
        message: 'You must wait 10 minutes before scanning this repository again.',
        nextScanAllowed: nextScanTime,
        remainingTime: Math.ceil((nextScanTime - new Date()) / 1000 / 60)
      });
    }

    // Daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyScans = await Scan.countDocuments({
      userId,
      createdAt: { $gte: today }
    });

    const DAILY_SCAN_LIMIT = 50;
    if (dailyScans >= DAILY_SCAN_LIMIT) {
      return res.status(429).json({
        success: false,
        message: `Daily scan limit reached (${DAILY_SCAN_LIMIT} scans per day).`,
        dailyLimit: DAILY_SCAN_LIMIT,
        scansUsed: dailyScans
      });
    }

    // Save the scan
    const scan = new Scan({ 
      userId, 
      repoUrl, 
      repoName, 
      status: 'pending',
      scanType: 'ai-powered',
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    });

    await scan.save();

    // ✅ Added log to trace crash point
    console.log(`🚀 Scan created for ${repoUrl}, scanId: ${scan._id}`);

    // Start AI scan safely
    try {
      await startScan(scan._id);  // now awaited to catch immediate crashes
//     
      console.log(`✅ Background scan started for scanId: ${scan._id}`);
    } catch (scanErr) {
      console.error(`❌ Background scan crash:`, scanErr);
      // Update scan status to 'failed'
      scan.status = 'failed';
      scan.error = scanErr.message || 'Unknown error in scan service';
      scan.scannedAt = new Date();
      await scan.save();
      return res.status(500).json({
        success: false,
        message: 'Failed to start scan due to internal AI error.',
        error: scan.error
      });
    }

    res.json({
      success: true,
      message: 'AI-powered scan started successfully',
      scanId: scan._id,
      status: 'pending',
      estimatedDuration: '2-5 minutes',
      scanType: 'ai-powered',
      dailyScansRemaining: DAILY_SCAN_LIMIT - dailyScans - 1
    });

  } catch (error) {
    console.error('🚨 Error initiating AI scan:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error. Please try again later.' 
    });
  }
});


  // GET /api/scan/history - Enhanced scan history with AI insights
  router.get('/history', auth, async (req, res) => {
    try {
      const userId = req.user.id;
      const page = Math.max(1, parseInt(req.query.page)) || 1;
      const limit = Math.min(50, parseInt(req.query.limit)) || 10;
      const status = req.query.status; // Filter by status
      const sortBy = req.query.sortBy || 'createdAt'; // Sort field
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

      // Build query
      const query = { userId };
      if (status && ['pending', 'scanning', 'completed', 'failed'].includes(status)) {
        query.status = status;
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder;

      const [scans, total, stats] = await Promise.all([
        Scan.find(query)
          .select('repoUrl repoName status scanResults.totalBugs scanResults.filesScanned scannedAt createdAt scanType error')
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit),
        Scan.countDocuments(query),
        // Get user statistics
        Scan.aggregate([
          { $match: { userId: userId } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalBugs: { $sum: '$scanResults.totalBugs' },
              totalFiles: { $sum: '$scanResults.filesScanned' }
            }
          }
        ])
      ]);

      // Process statistics
      const userStats = {
        totalScans: 0,
        completedScans: 0,
        failedScans: 0,
        totalBugsFound: 0,
        totalFilesScanned: 0
      };

      stats.forEach(stat => {
        userStats.totalScans += stat.count;
        if (stat._id === 'completed') {
          userStats.completedScans = stat.count;
          userStats.totalBugsFound = stat.totalBugs || 0;
          userStats.totalFilesScanned = stat.totalFiles || 0;
        } else if (stat._id === 'failed') {
          userStats.failedScans = stat.count;
        }
      });

      res.json({
        success: true,
        data: scans.map(scan => ({
          scanId: scan._id,
          repoUrl: scan.repoUrl,
          repoName: scan.repoName,
          status: scan.status,
          scanType: scan.scanType || 'ai-powered',
          totalBugs: scan.scanResults?.totalBugs || 0,
          filesScanned: scan.scanResults?.filesScanned || 0,
          scannedAt: scan.scannedAt,
          createdAt: scan.createdAt,
          error: scan.status === 'failed' ? scan.error : undefined
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalScans: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        },
        statistics: userStats
      });

    } catch (error) {
      console.error('🚨 Error fetching scan history:', error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error. Please try again later.' 
      });
    }
  });

  // Polling route used by frontend to check scan status
router.get('/status/:scanId', auth, async (req, res) => {
  try {
    const { scanId } = req.params;
    const userId = req.user.id;

    const scan = await Scan.findOne({ _id: scanId, userId });

    if (!scan) {
      return res.status(404).json({
        status: 'not_found',
        error: 'Scan not found or unauthorized'
      });
    }

    res.json({
      status: scan.status,
      ...(scan.status === 'completed' && { results: scan.scanResults }),
      ...(scan.status === 'failed' && { error: scan.error })
    });

  } catch (error) {
    console.error('❌ Error checking scan status:', error.message);
    res.status(500).json({
      status: 'error',
      error: 'Server error while checking scan status'
    });
  }
});

  // GET /api/scan/:scanId - Get detailed scan results
  router.get('/:scanId', auth, async (req, res) => {
    try {
      const { scanId } = req.params;
      const userId = req.user.id;

      const scan = await Scan.findOne({ _id: scanId, userId });

      if (!scan) {
        return res.status(404).json({
          success: false,
          message: 'Scan not found or access denied'
        });
      }

      res.json({
        success: true,
        data: {
          scanId: scan._id,
          repoUrl: scan.repoUrl,
          repoName: scan.repoName,
          status: scan.status,
          scanType: scan.scanType || 'ai-powered',
          createdAt: scan.createdAt,
          scannedAt: scan.scannedAt,
          duration: scan.scannedAt ? 
            Math.round((scan.scannedAt - scan.createdAt) / 1000) : null,
          scanResults: scan.scanResults || {},
          error: scan.status === 'failed' ? scan.error : undefined
        }
      });

    } catch (error) {
      console.error('🚨 Error fetching scan details:', error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error. Please try again later.' 
      });
    }
  });

  // DELETE /api/scan/:scanId - Delete a scan
  router.delete('/:scanId', auth, async (req, res) => {
    try {
      const { scanId } = req.params;
      const userId = req.user.id;

      const scan = await Scan.findOneAndDelete({ _id: scanId, userId });

      if (!scan) {
        return res.status(404).json({
          success: false,
          message: 'Scan not found or access denied'
        });
      }

      res.json({
        success: true,
        message: 'Scan deleted successfully'
      });

    } catch (error) {
      console.error('🚨 Error deleting scan:', error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error. Please try again later.' 
      });
    }
  });

  // GET /api/scan/stats/dashboard - Get dashboard statistics
  router.get('/stats/dashboard', auth, async (req, res) => {
    try {
      const userId = req.user.id;
      const timeRange = req.query.timeRange || '7d'; // 7d, 30d, 90d, all

      // Calculate date range
      let dateFilter = {};
      if (timeRange !== 'all') {
        const days = parseInt(timeRange.replace('d', ''));
        dateFilter = {
          createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
        };
      }

      const [overallStats, recentScans, bugTypeStats] = await Promise.all([
        // Overall statistics
        Scan.aggregate([
          { $match: { userId, ...dateFilter } },
          {
            $group: {
              _id: null,
              totalScans: { $sum: 1 },
              completedScans: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
              failedScans: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
              totalBugs: { $sum: '$scanResults.totalBugs' },
              totalFiles: { $sum: '$scanResults.filesScanned' },
              avgScanTime: { $avg: { 
                $divide: [{ $subtract: ['$scannedAt', '$createdAt'] }, 1000] 
              }}
            }
          }
        ]),
        
        // Recent scans for activity feed
        Scan.find({ userId, ...dateFilter })
          .select('repoName status createdAt scanResults.totalBugs')
          .sort({ createdAt: -1 })
          .limit(10),

        // Bug type distribution
        Scan.aggregate([
          { $match: { userId, status: 'completed', ...dateFilter } },
          { $unwind: '$scanResults.bugs' },
          {
            $group: {
              _id: '$scanResults.bugs.severity',
              count: { $sum: 1 }
            }
          }
        ])
      ]);

      const stats = overallStats[0] || {
        totalScans: 0,
        completedScans: 0,
        failedScans: 0,
        totalBugs: 0,
        totalFiles: 0,
        avgScanTime: 0
      };

      res.json({
        success: true,
        data: {
          overview: {
            totalScans: stats.totalScans,
            completedScans: stats.completedScans,
            failedScans: stats.failedScans,
            successRate: stats.totalScans > 0 ? 
              Math.round((stats.completedScans / stats.totalScans) * 100) : 0,
            totalBugsFound: stats.totalBugs || 0,
            totalFilesScanned: stats.totalFiles || 0,
            avgScanTime: Math.round(stats.avgScanTime || 0)
          },
          recentActivity: recentScans.map(scan => ({
            repoName: scan.repoName,
            status: scan.status,
            createdAt: scan.createdAt,
            bugsFound: scan.scanResults?.totalBugs || 0
          })),
          bugDistribution: bugTypeStats.reduce((acc, item) => {
            acc[item._id || 'unknown'] = item.count;
            return acc;
          }, {})
        }
      });

    } catch (error) {
      console.error('🚨 Error fetching dashboard stats:', error.message);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error. Please try again later.' 
      });
    }
  });

  // 🆕 NEW API: GET /api/scan/:scanId/bugs - Get detailed bugs for a specific scan
router.get('/:scanId/bugs', auth, async (req, res) => {
  try {
    const { scanId } = req.params;
    const userId = req.user.id;

    // Verify scan ownership
    const scan = await Scan.findOne({ _id: scanId, userId });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found or access denied'
      });
    }

    if (scan.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Scan is not completed yet'
      });
    }

    // Extract bugs from scan results
    const bugs = scan.scanResults?.bugs || [];

    // Transform bugs to include additional metadata
    const transformedBugs = bugs.map(bug => ({
      id: bug.id || `bug_${Math.random().toString(36).substr(2, 9)}`,
      file: bug.file || bug.filePath,
      filePath: bug.filePath || bug.file,
      line: bug.line || bug.lineNumber,
      column: bug.column,
      severity: mapSeverity(bug.severity), // 🔄 UPDATED: Use severity mapping
      type: bug.type || bug.category,
      message: bug.message || bug.description,
      rule: bug.rule || bug.ruleId,
      category: bug.category || bug.type,
      description: bug.description || bug.message,
      suggestion: bug.suggestion || bug.fix,
      codeSnippet: bug.codeSnippet || bug.code,
      createdAt: scan.scannedAt,
      scanId: scan._id,
      repoName: scan.repoName
    }));

    res.json({
      success: true,
      data: transformedBugs,
      totalBugs: transformedBugs.length,
      scanInfo: {
        scanId: scan._id,
        repoName: scan.repoName,
        scannedAt: scan.scannedAt,
        totalFiles: scan.scanResults?.filesScanned || 0
      }
    });

  } catch (error) {
    console.error('🚨 Error fetching scan bugs:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error. Please try again later.' 
    });
  }
});

// 🆕 NEW API: GET /api/scan/analytics/overview - Get analytics overview for visual insights
router.get('/analytics/overview', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { dateRange = '30', repository, severity, language } = req.query;

    // Calculate date filter
    const days = parseInt(dateRange) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build base query
    const baseQuery = {
      userId,
      status: 'completed',
      scannedAt: { $gte: startDate }
    };

    // Add repository filter if specified
    if (repository && repository !== 'all') {
      baseQuery.repoName = repository;
    }

    // Get all matching scans
    const scans = await Scan.find(baseQuery)
      .select('repoName scanResults scannedAt createdAt')
      .sort({ scannedAt: -1 });

    // Extract all bugs with filters
    let allBugs = [];
    scans.forEach(scan => {
      const bugs = scan.scanResults?.bugs || [];
      const transformedBugs = bugs.map(bug => ({
        ...bug,
        severity: mapSeverity(bug.severity), // 🔄 UPDATED: Use severity mapping
        scanId: scan._id,
        repoName: scan.repoName,
        scanDate: scan.scannedAt,
        language: extractLanguageFromFile(bug.file || bug.filePath || '')
      }));

      // Apply severity filter
      let filteredBugs = transformedBugs;
      if (severity && severity !== 'all') {
        filteredBugs = filteredBugs.filter(bug => 
          bug.severity.toLowerCase() === severity.toLowerCase()
        );
      }

      // Apply language filter
      if (language && language !== 'all') {
        filteredBugs = filteredBugs.filter(bug => bug.language === language);
      }

      allBugs.push(...filteredBugs);
    });

    // Calculate metrics
    const totalBugs = allBugs.length;
    const totalRepos = new Set(scans.map(s => s.repoName)).size;
    const avgBugsPerScan = scans.length > 0 ? (totalBugs / scans.length).toFixed(1) : '0.0';

    // 🔄 UPDATED: Severity distribution with correct mapping
    const severityCount = { critical: 0, major: 0, minor: 0, unknown: 0 };
    allBugs.forEach(bug => {
      const severity = bug.severity.toLowerCase();
      if (severityCount[severity] !== undefined) {
        severityCount[severity]++;
      } else {
        severityCount.unknown++;
      }
    });

    // 🔄 UPDATED: Timeline data with correct severity mapping
    const timelineData = {};
    for (let d = new Date(startDate); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      timelineData[dateKey] = { date: dateKey, total: 0, critical: 0, major: 0, minor: 0, unknown: 0 };
    }

    allBugs.forEach(bug => {
      const dateKey = new Date(bug.scanDate).toISOString().split('T')[0];
      if (timelineData[dateKey]) {
        timelineData[dateKey].total++;
        const severity = bug.severity.toLowerCase();
        if (timelineData[dateKey][severity] !== undefined) {
          timelineData[dateKey][severity]++;
        } else {
          timelineData[dateKey].unknown++;
        }
      }
    });

    // 🔄 UPDATED: Repository stats with correct severity mapping
    const repoStats = {};
    allBugs.forEach(bug => {
      const repo = bug.repoName || 'Unknown';
      if (!repoStats[repo]) {
        repoStats[repo] = { name: repo, bugs: 0, critical: 0, major: 0, minor: 0, unknown: 0 };
      }
      repoStats[repo].bugs++;
      const severity = bug.severity.toLowerCase();
      if (repoStats[repo][severity] !== undefined) {
        repoStats[repo][severity]++;
      } else {
        repoStats[repo].unknown++;
      }
    });

    // File stats
    const fileStats = {};
    allBugs.forEach(bug => {
      const file = bug.file || bug.filePath || 'Unknown';
      if (!fileStats[file]) {
        fileStats[file] = { file, bugs: 0 };
      }
      fileStats[file].bugs++;
    });

    // Get unique repositories and languages for filters
    const uniqueRepos = ['all', ...new Set(scans.map(s => s.repoName).filter(Boolean))];
    const uniqueLanguages = ['all', ...new Set(allBugs.map(b => b.language).filter(Boolean))];

    res.json({
      success: true,
      data: {
        summary: {
          totalBugs,
          totalRepos,
          avgBugsPerScan: parseFloat(avgBugsPerScan),
          totalScans: scans.length
        },
        severityDistribution: Object.entries(severityCount)
          .filter(([_, count]) => count > 0)
          .map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
            color: getSeverityColor(name)
          })),
        timeline: Object.values(timelineData).sort((a, b) => new Date(a.date) - new Date(b.date)),
        topRepositories: Object.values(repoStats)
          .sort((a, b) => b.bugs - a.bugs)
          .slice(0, 10),
        topFiles: Object.values(fileStats)
          .sort((a, b) => b.bugs - a.bugs)
          .slice(0, 15),
        filters: {
          repositories: uniqueRepos,
          languages: uniqueLanguages
        }
      }
    });

  } catch (error) {
    console.error('🚨 Error fetching analytics overview:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error. Please try again later.' 
    });
  }
});

// 🆕 NEW API: GET /api/scan/analytics/repositories - Get repository analytics
router.get('/analytics/repositories', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const repositories = await Scan.aggregate([
      { $match: { userId, status: 'completed' } },
      {
        $group: {
          _id: '$repoName',
          totalScans: { $sum: 1 },
          totalBugs: { $sum: '$scanResults.totalBugs' },
          totalFiles: { $sum: '$scanResults.filesScanned' },
          lastScan: { $max: '$scannedAt' },
          avgBugs: { $avg: '$scanResults.totalBugs' }
        }
      },
      { $sort: { totalBugs: -1 } }
    ]);

    res.json({
      success: true,
      data: repositories.map(repo => ({
        name: repo._id,
        totalScans: repo.totalScans,
        totalBugs: repo.totalBugs || 0,
        totalFiles: repo.totalFiles || 0,
        lastScan: repo.lastScan,
        avgBugs: Math.round(repo.avgBugs || 0)
      }))
    });

  } catch (error) {
    console.error('🚨 Error fetching repository analytics:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error. Please try again later.' 
    });
  }
});

// DELETE /api/scan/:scanId - Delete a scan
router.delete('/:scanId', auth, async (req, res) => {
  try {
    const { scanId } = req.params;
    const userId = req.user.id;

    const scan = await Scan.findOneAndDelete({ _id: scanId, userId });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Scan deleted successfully'
    });

  } catch (error) {
    console.error('🚨 Error deleting scan:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error. Please try again later.' 
    });
  }
});

// 🆕 NEW HELPER FUNCTION: Map database severity to display severity
function mapSeverity(dbSeverity) {
  if (!dbSeverity) return 'unknown';
  
  const severityMap = {
    'critical': 'critical',
    'high': 'major',
    'medium': 'minor', 
    'low': 'unknown'
  };
  
  return severityMap[dbSeverity.toLowerCase()] || 'unknown';
}

// Helper functions
function extractLanguageFromFile(filePath) {
  if (!filePath) return null;
  
  const extension = filePath.split('.').pop()?.toLowerCase();
  const languageMap = {
    'js': 'JavaScript',
    'jsx': 'JavaScript',
    'ts': 'TypeScript',
    'tsx': 'TypeScript',
    'py': 'Python',
    'java': 'Java',
    'php': 'PHP',
    'go': 'Go',
    'rs': 'Rust',
    'cpp': 'C++',
    'cc': 'C++',
    'cxx': 'C++',
    'c': 'C',
    'cs': 'C#',
    'rb': 'Ruby',
    'swift': 'Swift',
    'kt': 'Kotlin',
    'scala': 'Scala',
    'dart': 'Dart',
    'vue': 'Vue',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'sass': 'SASS',
    'less': 'LESS'
  };
  
  return languageMap[extension] || null;
}

// 🔄 UPDATED: Severity color mapping
function getSeverityColor(severity) {
  const colors = {
    critical: '#ef4444',  // Red
    major: '#f97316',     // Orange  
    minor: '#eab308',     // Yellow
    unknown: '#6b7280'    // Gray
  };
  return colors[severity.toLowerCase()] || '#6b7280';
}

module.exports = router;