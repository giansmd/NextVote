const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CandidateController {
  // Crear candidato en una elección
  async createCandidate(req, res) {
    try {
      const {
        electionId,
        fullName,
        photoUrl,
        listNumber,
        politicalMovement,
        position,
        faculty,
        school,
        workPlan
      } = req.body;

      if (!electionId || !fullName || !listNumber || !position) {
        return res.status(400).json({ error: 'Faltan campos obligatorios (electionId, fullName, listNumber, position)' });
      }

      // Verificar que la elección exista y no esté activa o finalizada
      const election = await prisma.election.findUnique({ where: { id: electionId } });
      if (!election) {
        return res.status(404).json({ error: 'Elección no encontrada' });
      }
      if (election.status === 'FINALIZED' || election.status === 'CANCELLED') {
        return res.status(400).json({ error: 'No se pueden añadir candidatos a una elección finalizada o cancelada' });
      }

      // Evitar duplicados de número de lista en la misma elección
      const existing = await prisma.candidate.findFirst({
        where: { electionId, listNumber }
      });
      if (existing) {
        return res.status(400).json({ error: `Ya existe un candidato con el número de lista ${listNumber} en esta elección` });
      }

      const candidate = await prisma.candidate.create({
        data: {
          electionId,
          fullName,
          photoUrl: photoUrl || null,
          listNumber,
          politicalMovement: politicalMovement || null,
          position,
          faculty: faculty || null,
          school: school || null,
          workPlan: workPlan || null
        }
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'CREATE_CANDIDATE',
          ipAddress: req.ip,
          details: { candidateId: candidate.id, electionId }
        }
      });

      res.status(201).json(candidate);
    } catch (error) {
      console.error('Error creating candidate:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener todos los candidatos de una elección
  async getCandidatesByElection(req, res) {
    try {
      const { electionId } = req.params;
      const candidates = await prisma.candidate.findMany({
        where: { electionId },
        orderBy: { listNumber: 'asc' }
      });
      res.json(candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Actualizar candidato
  async updateCandidate(req, res) {
    try {
      const { id } = req.params;
      const {
        fullName,
        photoUrl,
        listNumber,
        politicalMovement,
        position,
        faculty,
        school,
        workPlan,
        status
      } = req.body;

      const candidate = await prisma.candidate.findUnique({ where: { id } });
      if (!candidate) {
        return res.status(404).json({ error: 'Candidato no encontrado' });
      }

      const updated = await prisma.candidate.update({
        where: { id },
        data: {
          fullName: fullName ?? candidate.fullName,
          photoUrl: photoUrl ?? candidate.photoUrl,
          listNumber: listNumber ?? candidate.listNumber,
          politicalMovement: politicalMovement ?? candidate.politicalMovement,
          position: position ?? candidate.position,
          faculty: faculty ?? candidate.faculty,
          school: school ?? candidate.school,
          workPlan: workPlan ?? candidate.workPlan,
          status: status ?? candidate.status
        }
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'UPDATE_CANDIDATE',
          ipAddress: req.ip,
          details: { candidateId: id }
        }
      });

      res.json(updated);
    } catch (error) {
      console.error('Error updating candidate:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Cambiar estado activo/inactivo
  async toggleStatus(req, res) {
    try {
      const { id } = req.params;
      const candidate = await prisma.candidate.findUnique({ where: { id } });
      if (!candidate) {
        return res.status(404).json({ error: 'Candidato no encontrado' });
      }

      const newStatus = candidate.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const updated = await prisma.candidate.update({
        where: { id },
        data: { status: newStatus }
      });

      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'TOGGLE_CANDIDATE_STATUS',
          ipAddress: req.ip,
          details: { candidateId: id, newStatus }
        }
      });

      res.json(updated);
    } catch (error) {
      console.error('Error toggling candidate status:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Eliminar candidato
  async deleteCandidate(req, res) {
    try {
      const { id } = req.params;
      await prisma.candidate.delete({ where: { id } });

      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'DELETE_CANDIDATE',
          ipAddress: req.ip,
          details: { candidateId: id }
        }
      });

      res.json({ message: 'Candidato eliminado exitosamente' });
    } catch (error) {
      console.error('Error deleting candidate:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = new CandidateController();