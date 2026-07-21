const dummyTrafficService = require('../services/dummy-traffic.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const electionId = process.argv[2];
  if (!electionId) {
    console.error('Por favor provea el ID de la elección como argumento.');
    process.exit(1);
  }

  const election = await prisma.election.findUnique({ where: { id: electionId } });
  if (!election) {
    console.error('Elección no encontrada.');
    process.exit(1);
  }

  console.log(`Iniciando generación de tráfico ficticio para: ${election.name}`);
  dummyTrafficService.startTraffic(electionId);

  // Keep process alive
  process.on('SIGINT', () => {
    dummyTrafficService.stopTraffic(electionId);
    console.log('\nGeneración de tráfico ficticio detenida.');
    process.exit(0);
  });
}

run();