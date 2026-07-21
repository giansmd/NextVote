const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const blockchainService = require('../services/blockchain.service');

class BlockchainController {
  // Explorar la cadena de bloques de una elección
  async getBlocks(req, res) {
    try {
      const { electionId } = req.params;
      const blocks = await prisma.block.findMany({
        where: { electionId },
        orderBy: { index: 'asc' }
      });

      res.json(blocks);
    } catch (error) {
      console.error('Error fetching blockchain blocks:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Validar la integridad de la cadena de una elección
  async verifyChain(req, res) {
    try {
      const { electionId } = req.params;
      const isValid = await blockchainService.verifyIntegrity(electionId);
      
      const totalBlocks = await prisma.block.count({ where: { electionId } });
      const dummyBlocks = await prisma.block.count({ where: { electionId, isDummy: true } });
      const realBlocks = totalBlocks - dummyBlocks;

      res.json({
        electionId,
        isValid,
        stats: {
          totalBlocks,
          realBlocks,
          dummyBlocks
        },
        message: isValid ? 'La cadena de bloques es válida e íntegra.' : '¡ALERTA! La cadena de bloques presenta inconsistencias.'
      });
    } catch (error) {
      console.error('Error verifying blockchain integrity:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener los resultados del conteo de votos de una elección
  async getResults(req, res) {
    try {
      const { electionId } = req.params;

      const election = await prisma.election.findUnique({
        where: { id: electionId },
        include: { candidates: true }
      });

      if (!election) {
        return res.status(404).json({ error: 'Elección no encontrada' });
      }

      // Ejecutar conteo mediante el smart contract / blockchain service
      const rawCounts = await blockchainService.countVotes(electionId);

      // Combinar los resultados con los datos del candidato
      const candidateResults = election.candidates.map(candidate => {
        const resultData = rawCounts[candidate.id] || { votes: 0, totalWeight: 0 };
        return {
          id: candidate.id,
          fullName: candidate.fullName,
          listNumber: candidate.listNumber,
          politicalMovement: candidate.politicalMovement,
          position: candidate.position,
          photoUrl: candidate.photoUrl,
          rawVotes: resultData.votes,
          weightedVotes: resultData.totalWeight
        };
      });

      // Calcular totales generales
      const totalRawVotes = Object.values(rawCounts).reduce((acc, curr) => acc + curr.votes, 0);
      const totalWeightedVotes = Object.values(rawCounts).reduce((acc, curr) => acc + curr.totalWeight, 0);

      res.json({
        election: {
          id: election.id,
          name: election.name,
          status: election.status
        },
        summary: {
          totalRawVotes,
          totalWeightedVotes
        },
        candidates: candidateResults
      });
    } catch (error) {
      console.error('Error calculating election results:', error);
      res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
  }
}

module.exports = new BlockchainController();