const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const blockchainService = require('./blockchain.service');

class DummyTrafficService {
  constructor() {
    this.activeIntervals = {}; // electionId -> intervalId
  }

  /**
   * Inicia el tráfico dummy para una elección activa.
   * Genera un bloque dummy aleatoriamente cada 2 a 10 segundos.
   */
  startTraffic(electionId) {
    if (this.activeIntervals[electionId]) {
      return; // Ya está activo
    }

    const generateDummyBlock = async () => {
      try {
        // Verificar que la elección sigue activa
        const election = await prisma.election.findUnique({
          where: { id: electionId }
        });

        if (!election || election.status !== 'ACTIVE') {
          this.stopTraffic(electionId);
          return;
        }

        // Obtener un candidato al azar para disimular (o un dummy string)
        const candidates = await prisma.candidate.findMany({
          where: { electionId }
        });

        let dummyCandidateId = 'dummy_candidate_000';
        if (candidates.length > 0) {
          const randomIndex = Math.floor(Math.random() * candidates.length);
          dummyCandidateId = candidates[randomIndex].id;
        }

        await blockchainService.createBlock(electionId, dummyCandidateId, true, 0);
        
        // Programar el siguiente
        this.scheduleNext(electionId, generateDummyBlock);

      } catch (error) {
        console.error(`Error generando dummy block para elección ${electionId}:`, error);
        this.scheduleNext(electionId, generateDummyBlock);
      }
    };

    // Iniciar el ciclo
    this.scheduleNext(electionId, generateDummyBlock);
    console.log(`Dummy traffic iniciado para elección ${electionId}`);
  }

  scheduleNext(electionId, callback) {
    // Si ya fue detenido, no programar
    if (this.activeIntervals[electionId] === null) return;
    
    const randomMs = Math.floor(Math.random() * (10000 - 2000 + 1) + 2000); // 2s a 10s
    this.activeIntervals[electionId] = setTimeout(callback, randomMs);
  }

  /**
   * Detiene el tráfico dummy para una elección
   */
  stopTraffic(electionId) {
    if (this.activeIntervals[electionId]) {
      clearTimeout(this.activeIntervals[electionId]);
      this.activeIntervals[electionId] = null;
      delete this.activeIntervals[electionId];
      console.log(`Dummy traffic detenido para elección ${electionId}`);
    }
  }

  /**
   * Recupera las elecciones activas al reiniciar el servidor para continuar el dummy traffic
   */
  async recoverActiveElections() {
    const activeElections = await prisma.election.findMany({
      where: { status: 'ACTIVE' }
    });

    for (const election of activeElections) {
      this.startTraffic(election.id);
    }
  }
}

module.exports = new DummyTrafficService();
