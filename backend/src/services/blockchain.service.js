const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cryptoUtils = require('../utils/crypto');

class BlockchainService {
  /**
   * Obtiene el último bloque de la cadena para una elección
   */
  async getLastBlock(electionId) {
    return prisma.block.findFirst({
      where: { electionId },
      orderBy: { index: 'desc' }
    });
  }

  /**
   * Crea un bloque (voto o dummy)
   */
  async createBlock(electionId, voteData, isDummy = false, weight = 1) {
    const lastBlock = await this.getLastBlock(electionId);
    
    const index = lastBlock ? lastBlock.index + 1 : 0;
    const previousHash = lastBlock ? lastBlock.blockHash : '0';
    const timestamp = new Date();
    
    // El "voto" es el ID del candidato, que lo ciframos. 
    // Para dummy voteData puede ser un texto genérico o candidato al azar
    const encryptedVote = cryptoUtils.encrypt(voteData);
    const voteHash = cryptoUtils.hashSHA256(encryptedVote);
    
    const nonce = Math.floor(Math.random() * 1000000).toString();
    const merkleRoot = cryptoUtils.hashSHA256(voteHash); // Simulado con 1 voto
    
    // Firma digital simulada del servidor
    const signature = cryptoUtils.hashSHA256(`server_signature_${timestamp.getTime()}`);
    
    // Calcular el hash del bloque (todos los campos concatenados)
    const blockData = `${index}${timestamp.toISOString()}${previousHash}${voteHash}${nonce}${merkleRoot}${signature}${electionId}${isDummy}${weight}`;
    const blockHash = cryptoUtils.hashSHA256(blockData);

    const newBlock = await prisma.block.create({
      data: {
        index,
        timestamp,
        previousHash,
        voteHash,
        encryptedVote,
        nonce,
        merkleRoot,
        signature,
        blockHash,
        electionId,
        isDummy,
        weight
      }
    });

    return newBlock;
  }

  /**
   * Verifica la integridad de la cadena
   */
  async verifyIntegrity(electionId) {
    const blocks = await prisma.block.findMany({
      where: { electionId },
      orderBy: { index: 'asc' }
    });

    if (blocks.length === 0) return true;

    for (let i = 0; i < blocks.length; i++) {
      const currentBlock = blocks[i];
      
      // Validar genesis
      if (i === 0) {
        if (currentBlock.previousHash !== '0') return false;
      } else {
        const previousBlock = blocks[i - 1];
        if (currentBlock.previousHash !== previousBlock.blockHash) return false;
      }

      // Re-calcular hash
      const blockData = `${currentBlock.index}${currentBlock.timestamp.toISOString()}${currentBlock.previousHash}${currentBlock.voteHash}${currentBlock.nonce}${currentBlock.merkleRoot}${currentBlock.signature}${currentBlock.electionId}${currentBlock.isDummy}${currentBlock.weight}`;
      const calculatedHash = cryptoUtils.hashSHA256(blockData);
      
      if (calculatedHash !== currentBlock.blockHash) return false;
    }

    return true;
  }

  /**
   * Contea los votos válidos
   */
  async countVotes(electionId) {
    // 1. Verificar integridad
    const isValid = await this.verifyIntegrity(electionId);
    if (!isValid) {
      throw new Error('La cadena de bloques está corrupta');
    }

    // 2. Obtener bloques no dummy
    const validBlocks = await prisma.block.findMany({
      where: {
        electionId,
        isDummy: false
      }
    });

    // 3. Contar
    const results = {}; 

    for (const block of validBlocks) {
      const candidateId = cryptoUtils.decrypt(block.encryptedVote);
      
      if (!results[candidateId]) {
        results[candidateId] = { votes: 0, totalWeight: 0 };
      }
      results[candidateId].votes += 1;
      results[candidateId].totalWeight += block.weight;
    }

    return results;
  }
}

module.exports = new BlockchainService();