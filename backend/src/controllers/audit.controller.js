const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AuditController {
  async getLogs(req, res) {
    try {
      const { action, userId, limit = 100, page = 1 } = req.query;

      const take = parseInt(limit, 10);
      const skip = (parseInt(page, 10) - 1) * take;

      const where = {};
      if (action) where.action = action;
      if (userId) where.userId = userId;

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true
              }
            }
          }
        }),
        prisma.auditLog.count({ where })
      ]);

      res.json({
        total,
        page: parseInt(page, 10),
        totalPages: Math.ceil(total / take),
        logs
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = new AuditController();