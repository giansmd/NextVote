const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const dummyTrafficService = require('../services/dummy-traffic.service');

class ElectionController {
  async createElection(req, res) {
    try {
      const {
        name, description, academicPeriod, category, faculty, school,
        startDate, startTime, endDate, endTime
      } = req.body;

      const newElection = await prisma.election.create({
        data: {
          name, description, academicPeriod, category, faculty, school,
          startDate: new Date(startDate), startTime,
          endDate: new Date(endDate), endTime,
          createdBy: req.user.userId
        }
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'CREATE_ELECTION',
          ipAddress: req.ip,
          details: { electionId: newElection.id }
        }
      });

      res.status(201).json(newElection);
    } catch (error) {
      console.error('Error creating election:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getElections(req, res) {
    try {
      const elections = await prisma.election.findMany({
        orderBy: { startDate: 'desc' },
        include: {
          candidates: true,
          _count: {
            select: { blocks: true, credentials: true }
          }
        }
      });
      res.json(elections);
    } catch (error) {
      console.error('Error fetching elections:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getElectionById(req, res) {
    try {
      const { id } = req.params;
      const election = await prisma.election.findUnique({
        where: { id },
        include: {
          candidates: true,
          _count: {
            select: { blocks: true, credentials: true }
          }
        }
      });

      if (!election) {
        return res.status(404).json({ error: 'Elección no encontrada' });
      }

      res.json(election);
    } catch (error) {
      console.error('Error fetching election detail:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateElection(req, res) {
    try {
      const { id } = req.params;
      const election = await prisma.election.findUnique({ where: { id } });

      if (!election) {
        return res.status(404).json({ error: 'Elección no encontrada' });
      }

      if (election.status === 'ACTIVE' || election.status === 'FINALIZED') {
        return res.status(400).json({ error: 'No se puede editar una elección que está activa o finalizada' });
      }

      const {
        name, description, academicPeriod, category, faculty, school,
        startDate, startTime, endDate, endTime, observations
      } = req.body;

      const updated = await prisma.election.update({
        where: { id },
        data: {
          name: name ?? election.name,
          description: description ?? election.description,
          academicPeriod: academicPeriod ?? election.academicPeriod,
          category: category ?? election.category,
          faculty: faculty ?? election.faculty,
          school: school ?? election.school,
          startDate: startDate ? new Date(startDate) : election.startDate,
          startTime: startTime ?? election.startTime,
          endDate: endDate ? new Date(endDate) : election.endDate,
          endTime: endTime ?? election.endTime,
          observations: observations ?? election.observations
        }
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'UPDATE_ELECTION',
          ipAddress: req.ip,
          details: { electionId: id }
        }
      });

      res.json(updated);
    } catch (error) {
      console.error('Error updating election:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async startElection(req, res) {
    try {
      const { id } = req.params;
      const election = await prisma.election.update({
        where: { id },
        data: { status: 'ACTIVE' }
      });

      // Iniciar el tráfico dummy
      dummyTrafficService.startTraffic(id);

      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'START_ELECTION',
          ipAddress: req.ip,
          details: { electionId: id }
        }
      });

      res.json(election);
    } catch (error) {
      console.error('Error starting election:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async finishElection(req, res) {
    try {
      const { id } = req.params;
      const election = await prisma.election.update({
        where: { id },
        data: { status: 'FINALIZED' }
      });

      // Detener tráfico dummy
      dummyTrafficService.stopTraffic(id);

      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'FINISH_ELECTION',
          ipAddress: req.ip,
          details: { electionId: id }
        }
      });

      res.json(election);
    } catch (error) {
      console.error('Error finishing election:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async cancelElection(req, res) {
    try {
      const { id } = req.params;
      const election = await prisma.election.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      dummyTrafficService.stopTraffic(id);

      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'CANCEL_ELECTION',
          ipAddress: req.ip,
          details: { electionId: id }
        }
      });

      res.json(election);
    } catch (error) {
      console.error('Error cancelling election:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new ElectionController();