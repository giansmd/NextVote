const fs = require('fs');
const path = require('path');

function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  console.log(logMessage.trim());
  
  const logDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  fs.appendFileSync(path.join(logDir, 'app.log'), logMessage);
}

module.exports = {
  info: (msg) => log(msg, 'INFO'),
  warn: (msg) => log(msg, 'WARN'),
  error: (msg) => log(msg, 'ERROR')
};