const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to the Python executable - try to detect it automatically
function findPythonExecutable() {
  const possiblePaths = [
    'python',
    'python3',
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python39', 'python.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python38', 'python.exe'),
    path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python37', 'python.exe')
  ];

  for (const pythonPath of possiblePaths) {
    try {
      // On Windows, spawn doesn't throw if the command doesn't exist, so we need to check
      if (process.platform === 'win32' && pythonPath !== 'python' && pythonPath !== 'python3') {
        if (!fs.existsSync(pythonPath)) continue;
      }
      
      const result = spawn(pythonPath, ['-c', 'print("Python found")']);
      return pythonPath;
    } catch (error) {
      console.log(`Python executable not found at ${pythonPath}`);
    }
  }
  return 'python'; // Default to just 'python' and hope it works
}

// Path to the Flask API
const flaskApiPath = path.join(__dirname, 'flask_api', 'app.py');

// Check if virtual environment exists
const venvPythonPath = path.join(__dirname, 'flask_api', 'venv', 'Scripts', 'python.exe');
const pythonExecutable = fs.existsSync(venvPythonPath) ? venvPythonPath : findPythonExecutable();

console.log(`Starting Flask API using Python at: ${pythonExecutable}`);
console.log(`Flask API path: ${flaskApiPath}`);

// Start the Flask API
const flaskApi = spawn(pythonExecutable, [flaskApiPath], {
  stdio: 'inherit',
  detached: true
});

flaskApi.on('error', (error) => {
  console.error(`Failed to start Flask API: ${error.message}`);
});

// Keep track of the API process
let apiRunning = true;

flaskApi.on('close', (code) => {
  console.log(`Flask API process exited with code ${code}`);
  apiRunning = false;
});

// Handle process exit
process.on('exit', () => {
  if (apiRunning) {
    console.log('Shutting down Flask API...');
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', flaskApi.pid, '/f', '/t']);
    } else {
      flaskApi.kill();
    }
  }
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  if (apiRunning) {
    console.log('Shutting down Flask API...');
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', flaskApi.pid, '/f', '/t']);
    } else {
      flaskApi.kill();
    }
  }
  process.exit();
});

module.exports = flaskApi; 