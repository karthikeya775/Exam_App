const { spawn } = require('child_process');
const path = require('path');

console.log('Starting all servers...');

// Use shell:true to ensure commands run properly in Windows environment
const options = {
  shell: true,
  stdio: 'inherit'
};

// Start the Flask API
console.log('Starting Flask API server...');
const flaskApi = spawn('cd backend && npm run start:flask', [], options);

flaskApi.on('error', (error) => {
  console.error(`Failed to start Flask API: ${error.message}`);
});

// Start the backend server
console.log('Starting Node.js backend server...');
const backend = spawn('cd backend && npm run dev', [], options);

backend.on('error', (error) => {
  console.error(`Failed to start backend: ${error.message}`);
});

// Start the frontend server
console.log('Starting React frontend server...');
const frontend = spawn('cd frontend && npm run dev', [], options);

frontend.on('error', (error) => {
  console.error(`Failed to start frontend: ${error.message}`);
});

// Handle process exit
const servers = [flaskApi, backend, frontend];
let serversRunning = [true, true, true];

flaskApi.on('close', (code) => {
  console.log(`Flask API process exited with code ${code}`);
  serversRunning[0] = false;
});

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
  serversRunning[1] = false;
});

frontend.on('close', (code) => {
  console.log(`Frontend process exited with code ${code}`);
  serversRunning[2] = false;
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('Shutting down all servers...');
  
  servers.forEach((server, index) => {
    if (serversRunning[index]) {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', server.pid, '/f', '/t'], { shell: true });
      } else {
        server.kill();
      }
    }
  });
  
  process.exit();
}); 