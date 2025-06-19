const simpleGit = require("simple-git");
const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const { v4: uuidv4 } = require("uuid");

const TEMP_DIR = path.join(__dirname, "../temp");

async function cloneRepo(repoUrl) {
  const repoId = uuidv4();
  const repoPath = path.join(TEMP_DIR, repoId);

  try {
    await simpleGit().clone(repoUrl, repoPath);
    return repoPath;
  } catch (error) {
    throw new Error("Failed to clone repo: " + error.message);
  }
}

function runSemgrep(repoPath) {
  return new Promise((resolve, reject) => {
    const cmd = `semgrep --config=auto --json --quiet -o output.json`;
    exec(cmd, { cwd: repoPath }, async (error, stdout, stderr) => {
      if (error) return reject(`Semgrep error: ${stderr || error.message}`);

      // Read and parse semgrep output
      try {
        const output = await fs.readJson(path.join(repoPath, "output.json"));
        resolve(output);
      } catch (readError) {
        reject("Failed to read Semgrep output: " + readError.message);
      }
    });
  });
}

async function scanRepository(repoUrl) {
  const repoPath = await cloneRepo(repoUrl);
  const scanResults = await runSemgrep(repoPath);
  await fs.remove(repoPath); // Clean up
  return scanResults;
}

module.exports = { scanRepository };
