const { parseCSV } = require('../utils/csvParser');
const userController = require('../controllers/user.controller');

// Wrapper to simulate req/res for the controller from a script
async function run() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Por favor provea la ruta del archivo CSV como argumento.');
    process.exit(1);
  }

  try {
    const users = await parseCSV(filePath);
    
    // Simulate req object
    const req = {
      body: { users },
      user: { userId: 'system-script' },
      ip: '127.0.0.1'
    };
    
    // Simulate res object
    const res = {
      status: (code) => ({
        json: (data) => console.log(`[${code}]`, data)
      }),
      json: (data) => console.log('[200]', data)
    };

    await userController.importUsers(req, res);
  } catch (error) {
    console.error('Error importando votantes:', error);
  }
}

run();