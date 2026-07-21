// This script just forwards to the main prisma seed script
require('child_process').execSync('npx prisma db seed', { stdio: 'inherit' });