const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cryptoUtils = require('../utils/crypto');
const blockchainService = require('../services/blockchain.service');

class VotingController {
  async getCredential(req, res) {
    try {
      const { electionId } = req.params;
      const userId = req.user.userId;

      // 1. Verify election exists and is ACTIVE
      const election = await prisma.election.findUnique({ where: { id: electionId } });
      if (!election || election.status !== 'ACTIVE') {
        return res.status(400).json({ error: 'Election is not active' });
      }

      // 2. Verify user has not voted yet
      const existingCred = await prisma.credential.findUnique({
        where: {
          electionId_userId: { electionId, userId }
        }
      });

      if (existingCred && existingCred.usedAt !== null) {
        return res.status(403).json({ error: 'Ya has emitido tu voto en esta elección.' });
      }

      // 3. Determine weight (Teacher = 3, Student = 1)
      let weight = 1;
      if (req.user.role === 'TEACHER') weight = 3;

      // 4. Generate token
      const rawToken = cryptoUtils.generateAnonymousToken();
      const tokenHash = cryptoUtils.hashSHA256(`${rawToken}-${electionId}`);

      // 5. Save or update credential
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Valid for 15 minutes

      if (existingCred) {
        await prisma.credential.update({
          where: { id: existingCred.id },
          data: { tokenHash, expiresAt }
        });
      } else {
        await prisma.credential.create({
          data: {
            tokenHash,
            electionId,
            userId,
            weight,
            expiresAt
          }
        });
      }

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'GENERATE_CREDENTIAL',
          ipAddress: req.ip,
          details: { electionId }
        }
      });

      // 6. Return rawToken ONLY THIS TIME
      res.json({ token: rawToken, expiresAt });
    } catch (error) {
      console.error('Error generating credential:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async submitVote(req, res) {
    try {
      const { electionId, token, candidateId } = req.body;

      if (!electionId || !token || !candidateId) {
        return res.status(400).json({ error: 'Missing parameters' });
      }

      // 1. Hash the token to find the credential
      const tokenHash = cryptoUtils.hashSHA256(`${token}-${electionId}`);
      
      const credential = await prisma.credential.findUnique({
        where: { tokenHash }
      });

      if (!credential) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      if (credential.electionId !== electionId) {
        return res.status(401).json({ error: 'Token does not belong to this election' });
      }

      if (credential.usedAt !== null) {
        return res.status(403).json({ error: 'Token already used' });
      }

      if (new Date() > new Date(credential.expiresAt)) {
        return res.status(403).json({ error: 'Token expired' });
      }

      if (credential.isRevoked) {
        return res.status(403).json({ error: 'Token revoked' });
      }

      // 2. Submit to blockchain
      const block = await blockchainService.createBlock(electionId, candidateId, false, credential.weight);

      // 3. Mark credential as used
      await prisma.credential.update({
        where: { id: credential.id },
        data: { usedAt: new Date() }
      });

      // NO AUDIT LOG for vote content. We could log the vote event, but without user info.
      // But we don't have user info here in a real anonymous system (well, we have it in credential.userId, but we should not log it linked to the vote).
      await prisma.auditLog.create({
        data: {
          action: 'SUBMIT_VOTE',
          ipAddress: req.ip,
          details: { electionId, blockHash: block.blockHash }
        }
      });

      res.status(201).json({
        message: 'Vote registered successfully in the blockchain',
        blockHash: block.blockHash,
        transactionId: block.id
      });
    } catch (error) {
      console.error('Error submitting vote:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async checkStatus(req, res) {
    try {
      const { electionId } = req.params;
      const userId = req.user.userId;

      const credential = await prisma.credential.findUnique({
        where: {
          electionId_userId: { electionId, userId }
        }
      });

      if (!credential) {
        return res.json({ hasVoted: false, hasCredential: false });
      }

      res.json({
        hasCredential: true,
        hasVoted: credential.usedAt !== null,
        issuedAt: credential.issuedAt,
        usedAt: credential.usedAt
      });
    } catch (error) {
      console.error('Error checking vote status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new VotingController();