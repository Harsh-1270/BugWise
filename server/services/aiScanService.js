const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const Scan = require('../models/Scan');

// AI Model Configuration
const AI_CONFIG = {
  // Using Hugging Face Inference API (free tier)
  HUGGINGFACE_API_URL: 'https://api-inference.huggingface.co/models',
  CODEBERT_MODEL: 'microsoft/codebert-base',
  // Alternative free models for code analysis
  CODET5_MODEL: 'Salesforce/codet5-base',
  GRAPHCODEBERT_MODEL: 'microsoft/graphcodebert-base',
  
  // Rate limiting and timeouts
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  REQUEST_TIMEOUT: 30000,
};

// Bug patterns and vulnerability signatures
const BUG_PATTERNS = {
  'sql-injection': {
    patterns: [
      /query\s*\+\s*['"]/gi,
      /execute\s*\(\s*['"]/gi,
      /SELECT.*FROM.*WHERE.*=.*\+/gi,
      /\$_GET\[.*\].*query/gi,
      /\$_POST\[.*\].*query/gi
    ],
    severity: 'major',
    category: 'Security'
  },
  'xss-vulnerability': {
    patterns: [
      /innerHTML\s*=\s*.*\+/gi,
      /document\.write\s*\(/gi,
      /eval\s*\(/gi,
      /dangerouslySetInnerHTML/gi
    ],
    severity: 'critical',
    category: 'Security'
  },
  'buffer-overflow': {
    patterns: [
      /strcpy\s*\(/gi,
      /strcat\s*\(/gi,
      /sprintf\s*\(/gi,
      /gets\s*\(/gi
    ],
    severity: 'critical',
    category: 'Security'
  },
  'memory-leak': {
    patterns: [
      /malloc\s*\(.*\).*(?!free)/gi,
      /new\s+\w+.*(?!delete)/gi,
      /calloc\s*\(.*\).*(?!free)/gi
    ],
    severity: 'minor',
    category: 'Memory Management'
  },
  'null-pointer': {
    patterns: [
      /\*\w+\s*(?!\s*!=\s*null)(?!\s*!=\s*NULL)/gi,
      /\w+\.\w+\s*(?!\s*!=\s*null)/gi,
      /\[\w+\]\s*(?!\s*!=\s*null)/gi
    ],
    severity: 'major',
    category: 'Runtime Error'
  },
  'hardcoded-secrets': {
    patterns: [
      /password\s*=\s*['"]\w+['"]/gi,
      /api_key\s*=\s*['"]\w+['"]/gi,
      /secret\s*=\s*['"]\w+['"]/gi,
      /token\s*=\s*['"]\w+['"]/gi
    ],
    severity: 'critical',
    category: 'Security'
  },
  'insecure-random': {
    patterns: [
      /Math\.random\(\)/gi,
      /rand\(\)/gi,
      /Random\(\)/gi
    ],
    severity: 'minor',
    category: 'Security'
  },
  'race-condition': {
    patterns: [
      /pthread_create.*(?!pthread_join)/gi,
      /thread.*start.*(?!join)/gi,
      /async.*(?!await)/gi
    ],
    severity: 'minor',
    category: 'Concurrency'
  }
};

// File extensions to scan
const SCANNABLE_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx',
  '.py', '.java', '.cpp', '.c', '.h',
  '.php', '.rb', '.go', '.rs',
  '.cs', '.swift', '.kt', '.scala'
];

class AICodeAnalyzer {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY; 
    this.tempDir = path.join(__dirname, '../temp');
    this.ensureTempDir();
  }

normalizeSeverity(severity) {
  const severityMap = {
    'critical': 'critical',
    'high': 'major', 
    'medium': 'minor',
    'low': 'minor',
    'unknown': 'unknown'
  };
  
  const normalized = severity.toLowerCase();
  return severityMap[normalized] || 'unknown';
}
  async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  // Clone repository to temporary directory
  async cloneRepository(repoUrl) {
    const repoName = repoUrl.split('/').pop().replace('.git', '');
    const repoPath = path.join(this.tempDir, `${repoName}_${Date.now()}`);
    
    try {
      console.log(`📥 Cloning repository: ${repoUrl}`);
      execSync(`git clone --depth 1 ${repoUrl} "${repoPath}"`, { 
        stdio: 'ignore',
        timeout: 60000 // 1 minute timeout
      });
      
      return repoPath;
    } catch (error) {
      console.error('Failed to clone repository:', error.message);
      throw new Error(`Failed to clone repository: ${error.message}`);
    }
  }

  // Get all scannable files from repository
  async getScannableFiles(repoPath) {
    const files = [];
    
    async function scanDirectory(dir) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          // Skip common directories that shouldn't be scanned
          if (entry.isDirectory()) {
            if (!['node_modules', '.git', 'dist', 'build', 'vendor', '.vscode'].includes(entry.name)) {
              await scanDirectory(fullPath);
            }
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (SCANNABLE_EXTENSIONS.includes(ext)) {
              files.push({
                path: fullPath,
                relativePath: path.relative(repoPath, fullPath),
                extension: ext,
                size: 0 // Will be filled later
              });
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to scan directory ${dir}:`, error.message);
      }
    }
    
    await scanDirectory(repoPath);
    
    // Get file sizes and filter out large files
    const MAX_FILE_SIZE = 100 * 1024; // 100KB limit per file
    const validFiles = [];
    
    for (const file of files) {
      try {
        const stats = await fs.stat(file.path);
        if (stats.size <= MAX_FILE_SIZE) {
          file.size = stats.size;
          validFiles.push(file);
        }
      } catch (error) {
        console.warn(`Failed to get stats for ${file.path}:`, error.message);
      }
    }
    
    return validFiles.slice(0, 100); // Limit to 100 files
  }

  // Read file content
  async readFileContent(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      console.warn(`Failed to read file ${filePath}:`, error.message);
      return null;
    }
  }

  // Analyze code using pattern matching (fast, free)
  analyzeWithPatterns(content, filePath) {
    const bugs = [];
    const extension = path.extname(filePath).toLowerCase();
    
    for (const [bugType, config] of Object.entries(BUG_PATTERNS)) {
      for (const pattern of config.patterns) {
        const matches = content.matchAll(pattern);
        
        for (const match of matches) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          
          bugs.push({
            type: bugType,
            severity: config.severity,
            category: config.category,
            message: this.getBugMessage(bugType),
            file: path.basename(filePath),
            line: lineNumber,
            column: match.index - content.lastIndexOf('\n', match.index),
            code: match[0].trim(),
            suggestion: this.getBugSuggestion(bugType)
          });
        }
      }
    }
    
    return bugs;
  }

  // Enhanced AI analysis using CodeBERT (when API key is available)
  async analyzeWithAI(content, filePath) {
    if (!this.apiKey) {
      return []; // Fallback to pattern matching only
    }

    try {
      const chunks = this.chunkCode(content, 512); // Split large files
      const allBugs = [];

      for (const chunk of chunks) {
        const prompt = this.createAnalysisPrompt(chunk, filePath);
        const response = await this.queryHuggingFace(prompt);
        
        if (response && response.length > 0) {
          const aiBugs = this.parseAIResponse(response[0].generated_text, filePath);
          allBugs.push(...aiBugs);
        }
        
        // Rate limiting
        await this.sleep(1000);
      }

      return allBugs;
    } catch (error) {
      console.warn(`AI analysis failed for ${filePath}:`, error.message);
      return [];
    }
  }

  // Create analysis prompt for AI model
  createAnalysisPrompt(code, filePath) {
    const extension = path.extname(filePath).toLowerCase();
    const language = this.getLanguageFromExtension(extension);
    
    return `Analyze this ${language} code for bugs and vulnerabilities:

\`\`\`${language}
${code}
\`\`\`

Find potential issues including:
- Security vulnerabilities
- Memory leaks
- Null pointer dereferences
- Race conditions
- Logic errors

Format: BUG: [type] | SEVERITY: [high/medium/low] | LINE: [number] | MESSAGE: [description]`;
  }

  // Query Hugging Face API
  async queryHuggingFace(prompt, retries = 0) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await axios.post(
        `${AI_CONFIG.HUGGINGFACE_API_URL}/${AI_CONFIG.CODEBERT_MODEL}`,
        {
          inputs: prompt,
          parameters: {
            max_length: 200,
            temperature: 0.1,
            do_sample: true
          }
        },
        {
          headers,
          timeout: AI_CONFIG.REQUEST_TIMEOUT
        }
      );

      return response.data;
    } catch (error) {
      if (retries < AI_CONFIG.MAX_RETRIES) {
        await this.sleep(AI_CONFIG.RETRY_DELAY * (retries + 1));
        return this.queryHuggingFace(prompt, retries + 1);
      }
      
      throw error;
    }
  }

  // Parse AI response to extract bugs
  parseAIResponse(aiText, filePath) {
    const bugs = [];
    const lines = aiText.split('\n');
    
    for (const line of lines) {
      if (line.includes('BUG:')) {
        try {
          const parts = line.split('|').map(p => p.trim());
          const type = parts[0].replace('BUG:', '').trim();
          const severity = parts[1].replace('SEVERITY:', '').trim();
          const lineNum = parseInt(parts[2].replace('LINE:', '').trim()) || 1;
          const message = parts[3].replace('MESSAGE:', '').trim();
          
          bugs.push({
            type: type.toLowerCase().replace(/\s+/g, '-'),
            severity: this.normalizeSeverity(severity),
            category: 'AI Detected',
            message,
            file: path.basename(filePath),
            line: lineNum,
            column: 0,
            code: '',
            suggestion: 'Review and fix the identified issue'
          });
        } catch (error) {
          console.warn('Failed to parse AI response line:', line);
        }
      }
    }
    
    return bugs;
  }

  // Utility functions
  chunkCode(code, maxTokens) {
    const lines = code.split('\n');
    const chunks = [];
    let currentChunk = [];
    let currentLength = 0;
    
    for (const line of lines) {
      if (currentLength + line.length > maxTokens && currentChunk.length > 0) {
        chunks.push(currentChunk.join('\n'));
        currentChunk = [line];
        currentLength = line.length;
      } else {
        currentChunk.push(line);
        currentLength += line.length;
      }
    }
    
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n'));
    }
    
    return chunks;
  }

  getLanguageFromExtension(ext) {
    const langMap = {
      '.js': 'javascript', '.jsx': 'javascript', '.ts': 'typescript', '.tsx': 'typescript',
      '.py': 'python', '.java': 'java', '.cpp': 'cpp', '.c': 'c', '.h': 'c',
      '.php': 'php', '.rb': 'ruby', '.go': 'go', '.rs': 'rust',
      '.cs': 'csharp', '.swift': 'swift', '.kt': 'kotlin', '.scala': 'scala'
    };
    return langMap[ext] || 'text';
  }

  getBugMessage(bugType) {
    const messages = {
      'sql-injection': 'Potential SQL injection vulnerability detected',
      'xss-vulnerability': 'Cross-site scripting (XSS) vulnerability found',
      'buffer-overflow': 'Buffer overflow vulnerability detected',
      'memory-leak': 'Potential memory leak detected',
      'null-pointer': 'Null pointer dereference risk',
      'hardcoded-secrets': 'Hardcoded credentials or secrets found',
      'insecure-random': 'Insecure random number generation',
      'race-condition': 'Potential race condition detected'
    };
    return messages[bugType] || 'Code quality issue detected';
  }

  getBugSuggestion(bugType) {
    const suggestions = {
      'sql-injection': 'Use parameterized queries or prepared statements',
      'xss-vulnerability': 'Sanitize user input and use safe DOM methods',
      'buffer-overflow': 'Use safe string functions or bounds checking',
      'memory-leak': 'Ensure proper memory deallocation',
      'null-pointer': 'Add null checks before dereferencing',
      'hardcoded-secrets': 'Use environment variables or secure config',
      'insecure-random': 'Use cryptographically secure random generators',
      'race-condition': 'Use proper synchronization mechanisms'
    };
    return suggestions[bugType] || 'Review and improve code quality';
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Clean up temporary files
  async cleanup(repoPath) {
    try {
      if (repoPath && await fs.access(repoPath).then(() => true).catch(() => false)) {
        await fs.rm(repoPath, { recursive: true, force: true });
        console.log(`🧹 Cleaned up temporary directory: ${repoPath}`);
      }
    } catch (error) {
      console.warn('Failed to cleanup temporary directory:', error.message);
    }

    
  }
}

// Main scanning functions


async function scanRepository(repoUrl) {
  const analyzer = new AICodeAnalyzer();
  let repoPath = null;
  
  try {
    console.log(`🚀 Starting AI-powered scan for: ${repoUrl}`);
    
    // Clone repository
    repoPath = await analyzer.cloneRepository(repoUrl);
    
    // Get scannable files
    const files = await analyzer.getScannableFiles(repoPath);
    console.log(`📁 Found ${files.length} files to analyze`);
    
    if (files.length === 0) {
      throw new Error('No scannable files found in repository');
    }
    
    // Initialize scan results
    const scanResults = {
      repository: repoUrl,
      timestamp: new Date(),
      totalFiles: files.length,
      bugs: [],
      summary: {
        Critical: 0,
        Major: 0,
        Minor: 0,
        Unknown: 0,
        total: 0
      },
      categories: {},
      duration: 0
    };
    
    const startTime = Date.now();
    
    // Analyze each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`🔍 Analyzing [${i + 1}/${files.length}]: ${file.relativePath}`);
      
      try {
        const content = await analyzer.readFileContent(file.path);
        if (!content) continue;
        
        // Pattern-based analysis (always runs)
        const patternBugs = analyzer.analyzeWithPatterns(content, file.path);
        
        // AI-based analysis (if API key available)
        const aiBugs = await analyzer.analyzeWithAI(content, file.path);
        
        // Combine and deduplicate bugs
        const allBugs = [...patternBugs, ...aiBugs];
        const uniqueBugs = deduplicateBugs(allBugs);
        
        // Add file info to bugs
        uniqueBugs.forEach(bug => {
          bug.filePath = file.relativePath;
          bug.fileSize = file.size;
          bug.fileExtension = file.extension;
        });
        
        scanResults.bugs.push(...uniqueBugs);
        
        // Update progress
        if ((i + 1) % 10 === 0 || i === files.length - 1) {
          console.log(`📊 Progress: ${i + 1}/${files.length} files analyzed`);
        }
        
      } catch (error) {
        console.warn(`⚠️  Failed to analyze ${file.relativePath}: ${error.message}`);
      }
    }
    
    // Calculate summary statistics
    scanResults.duration = (Date.now() - startTime) / 1000;
    scanResults.summary = calculateSummary(scanResults.bugs);
    scanResults.categories = calculateCategories(scanResults.bugs);
    
    console.log(`✅ Scan completed in ${scanResults.duration}ms`);
    console.log(`🐛 Found ${scanResults.summary.total} potential issues`);
    
    return scanResults;
    
  } catch (error) {
    console.error('❌ Scan failed:', error.message);
    throw error;
  } finally {
    // Cleanup temporary files
    if (repoPath) {
      await analyzer.cleanup(repoPath);
    }
  }
}

// New wrapper function that takes scanId, calls scanRepository internally
async function startScan(scanId) {
  const scan = await Scan.findById(scanId);
  if (!scan) {
    throw new Error('Scan record not found');
  }

  try {
    const results = await scanRepository(scan.repoUrl);

    // Defensive check and transformation for severity summary
    const severity = results.summary || {};
    const severityCounts = {
      Critical: severity.critical || 0,
      Major: severity.major || 0,
      Minor: severity.minor || 0,
      Unknown: severity.unknown || 0,
      total: severity.total || 0,
    };

    // Validate and map bugs to required fields - fill missing required fields with defaults or throw error
    const bugs = (results.bugs || []).map(bug => {
      if (
        !bug.type ||
        !bug.severity ||
        !bug.category ||
        !bug.message ||
        !bug.file ||
        typeof bug.line !== 'number'
      ) {
        throw new Error(`Bug missing required fields: ${JSON.stringify(bug)}`);
      }

      // Validate severity value enum
      const validSeverities = ['critical', 'major', 'minor', 'unknown'];
      if (!validSeverities.includes(bug.severity)) {
        throw new Error(`Invalid severity value: ${bug.severity}`);
      }

      

      return {
        type: bug.type,
        severity: bug.severity,
        category: bug.category,
        message: bug.message,
        file: bug.file,
        filePath: bug.filePath || '',
        line: bug.line,
        column: bug.column || null,
        code: bug.code || '',
        suggestion: bug.suggestion || ''
      };
    });

    scan.status = 'completed';
    scan.scannedAt = new Date();
    scan.scanResults = {
      totalBugs: severityCounts.total,
      bugs,
      filesScanned: results.totalFiles || 0,
      duration: results.duration || 0,   // match schema field name exactly
      categories: results.categories || new Map(),
      severity: severityCounts,
      timestamp: new Date()
    };

    await scan.save();

    return results;

  } catch (error) {
    scan.status = 'failed';
    scan.error = error.message || 'Unknown scanning error';
    scan.scannedAt = new Date();
    await scan.save();

    throw error;
  }
}



// Scan a single file
async function scanFile(filePath) {
  const analyzer = new AICodeAnalyzer();
  
  try {
    console.log(`🔍 Analyzing file: ${filePath}`);
    
    const content = await analyzer.readFileContent(filePath);
    if (!content) {
      throw new Error('Unable to read file content');
    }
    
    // Pattern-based analysis
    const patternBugs = analyzer.analyzeWithPatterns(content, filePath);
    
    // AI-based analysis
    const aiBugs = await analyzer.analyzeWithAI(content, filePath);
    
    // Combine results
    const allBugs = [...patternBugs, ...aiBugs];
    const uniqueBugs = deduplicateBugs(allBugs);
    
    const results = {
      file: path.basename(filePath),
      filePath: filePath,
      timestamp: new Date(),
      bugs: uniqueBugs,
      summary: calculateSummary(uniqueBugs),
      categories: calculateCategories(uniqueBugs)
    };
    
    console.log(`✅ Found ${uniqueBugs.length} potential issues`);
    return results;
    
  } catch (error) {
    console.error('❌ File scan failed:', error.message);
    throw error;
  }
}

// Utility functions
function deduplicateBugs(bugs) {
  const unique = new Map();
  
  for (const bug of bugs) {
    const key = `${bug.type}_${bug.file}_${bug.line}_${bug.column}`;
    if (!unique.has(key) || unique.get(key).severity === 'low') {
      unique.set(key, bug);
    }
  }
  
  return Array.from(unique.values());
}

function calculateSummary(bugs) {
  const summary = { Critical: 0, Major: 0, Minor: 0, Unknown: 0, total: 0 };
  
  for (const bug of bugs) {
    summary[bug.severity] = (summary[bug.severity] || 0) + 1;
    summary.total++;
  }
  
  return summary;
}

function calculateCategories(bugs) {
  const categories = {};
  
  for (const bug of bugs) {
    categories[bug.category] = (categories[bug.category] || 0) + 1;
  }
  
  return categories;
}

// Save scan results to database
async function saveScanResults(scanResults, userId) {
  try {
    const scan = new Scan({
      userId,
      repository: scanResults.repository,
      status: 'completed',
      results: {
        totalFiles: scanResults.totalFiles,
        totalBugs: scanResults.summary.total,
        severity: scanResults.summary,
        categories: scanResults.categories,
        duration: scanResults.duration,
        bugs: scanResults.bugs.slice(0, 1000) // Limit stored bugs to prevent huge documents
      },
      createdAt: scanResults.timestamp
    });
    
    await scan.save();
    console.log(`💾 Scan results saved to database with ID: ${scan._id}`);
    return scan._id;
    
  } catch (error) {
    console.error('Failed to save scan results:', error);
    throw error;
  }
}

// Generate detailed report
function generateReport(scanResults) {
  const report = {
    title: `AI Code Security Analysis Report`,
    repository: scanResults.repository,
    timestamp: scanResults.timestamp.toISOString(),
    summary: scanResults.summary,
    categories: scanResults.categories,
    duration: `${(scanResults.duration / 1000).toFixed(2)}s`,
    recommendations: generateRecommendations(scanResults.bugs),
    topIssues: getTopIssues(scanResults.bugs),
    fileStats: getFileStatistics(scanResults.bugs)
  };
  
  return report;
}

function generateRecommendations(bugs) {
  const recommendations = [];
  const severityCounts = calculateSummary(bugs);
  
  if (severityCounts.critical > 0) {
    recommendations.push({
      priority: 'URGENT',
      message: `Address ${severityCounts.critical} critical security vulnerabilities immediately`,
      action: 'Review and fix all critical issues before deployment'
    });
  }
  
  if (severityCounts.high > 5) {
    recommendations.push({
      priority: 'HIGH',
      message: `${severityCounts.high} high-severity issues detected`,
      action: 'Implement security review process and input validation'
    });
  }
  
  if (severityCounts.medium > 10) {
    recommendations.push({
      priority: 'MEDIUM',
      message: `Code quality needs improvement (${severityCounts.medium} medium issues)`,
      action: 'Consider implementing static analysis in CI/CD pipeline'
    });
  }
  
  return recommendations;
}

function getTopIssues(bugs) {
  const issueTypes = {};
  
  for (const bug of bugs) {
    issueTypes[bug.type] = (issueTypes[bug.type] || 0) + 1;
  }
  
  return Object.entries(issueTypes)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([type, count]) => ({ type, count }));
}

function getFileStatistics(bugs) {
  const fileStats = {};
  
  for (const bug of bugs) {
    const file = bug.file || bug.filePath;
    if (!fileStats[file]) {
      fileStats[file] = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
    }
    fileStats[file].total++;
    fileStats[file][bug.severity]++;
  }
  
  return Object.entries(fileStats)
    .sort(([,a], [,b]) => b.total - a.total)
    .slice(0, 10)
    .map(([file, stats]) => ({ file, ...stats }));
}

// Export functions
module.exports = {
  AICodeAnalyzer,
  startScan, 
  scanRepository,
  scanFile,
  saveScanResults,
  generateReport,
  BUG_PATTERNS,
  AI_CONFIG
};

// CLI usage example
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage:
  node ai-scanner.js <repository-url>
  node ai-scanner.js --file <file-path>

Examples:
  node ai-scanner.js https://github.com/user/repo.git
  node ai-scanner.js --file ./src/app.js

Environment Variables:
  HUGGINGFACE_API_KEY - Optional API key for enhanced AI analysis
    `);
    process.exit(1);
  }
  
  async function main() {
    try {
      if (args[0] === '--file' && args[1]) {
        const results = await scanFile(args[1]);
        console.log(JSON.stringify(results, null, 2));
      } else {
        const results = await scanRepository(args[0]);
        const report = generateReport(results);
        console.log(JSON.stringify(report, null, 2));
      }
    } catch (error) {
      console.error('Scan failed:', error.message);
      process.exit(1);
    }
  }
  
  main();
}