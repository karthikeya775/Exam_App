const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to the Flask API directory
const flaskApiDir = path.join(__dirname, 'flask_api');
const requirementsPath = path.join(flaskApiDir, 'requirements.txt');

// Function to find Python executable
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
      if (process.platform === 'win32' && pythonPath !== 'python' && pythonPath !== 'python3') {
        if (!fs.existsSync(pythonPath)) continue;
      }
      
      const result = spawn(pythonPath, ['-c', 'print("Python found")']);
      return pythonPath;
    } catch (error) {
      console.log(`Python executable not found at ${pythonPath}`);
    }
  }
  return 'python'; // Default to 'python' and hope it works
}

// Check if requirements.txt exists
if (!fs.existsSync(requirementsPath)) {
  console.error(`Requirements file not found at ${requirementsPath}`);
  process.exit(1);
}

const pythonExecutable = findPythonExecutable();
console.log(`Using Python executable: ${pythonExecutable}`);

// Install required Python packages
console.log('Installing Flask API dependencies...');
const pip = spawn(pythonExecutable, ['-m', 'pip', 'install', '-r', requirementsPath], {
  stdio: 'inherit',
  cwd: flaskApiDir
});

pip.on('error', (error) => {
  console.error(`Failed to install dependencies: ${error.message}`);
});

pip.on('close', (code) => {
  if (code === 0) {
    console.log('Flask API dependencies installed successfully!');
    console.log('You can now run the Flask API with `npm run start:flask` or the full stack with `npm run dev:all`');
  } else {
    console.error(`Failed to install dependencies. Exit code: ${code}`);
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(flaskApiDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log(`Creating uploads directory at ${uploadsDir}`);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create templates directory if it doesn't exist
const templatesDir = path.join(flaskApiDir, 'templates');
if (!fs.existsSync(templatesDir)) {
  console.log(`Creating templates directory at ${templatesDir}`);
  fs.mkdirSync(templatesDir, { recursive: true });
} 