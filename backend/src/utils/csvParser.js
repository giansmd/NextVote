const fs = require('fs');
const readline = require('readline');

async function parseCSV(filePath) {
  const users = [];
  const fileStream = fs.createReadStream(filePath);
  
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let isFirstLine = true;
  let headers = [];

  for await (const line of rl) {
    if (isFirstLine) {
      headers = line.split(',').map(h => h.trim());
      isFirstLine = false;
      continue;
    }
    
    const values = line.split(',');
    if (values.length === headers.length) {
      const user = {};
      headers.forEach((header, index) => {
        user[header] = values[index].trim();
      });
      users.push(user);
    }
  }

  return users;
}

module.exports = { parseCSV };