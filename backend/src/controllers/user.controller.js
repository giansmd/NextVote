const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

class UserController {
  async importUsers(req, res) {
    try {
      const { users } = req.body; 
      
      const createdUsers = [];
      for (const userData of users) {
        const { email, password, role, fullName, code, faculty, school, department } = userData;

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await prisma.user.create({
          data: {
            email,
            passwordHash,
            role
          }
        });

        if (role === 'STUDENT') {
          await prisma.student.create({
            data: {
              userId: newUser.id,
              studentCode: code,
              fullName,
              faculty,
              school,
              institutionalEmail: email
            }
          });
        } else if (role === 'TEACHER') {
          await prisma.teacher.create({
            data: {
              userId: newUser.id,
              teacherCode: code,
              fullName,
              faculty,
              department,
              institutionalEmail: email
            }
          });
        }
        createdUsers.push(newUser);
      }

      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'IMPORT_USERS',
          ipAddress: req.ip,
          details: { count: createdUsers.length }
        }
      });

      res.status(201).json({ message: `Successfully imported ${createdUsers.length} users.` });
    } catch (error) {
      console.error('Error importing users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          student: true,
          teacher: true
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async toggleUserStatus(req, res) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id },
        include: { student: true, teacher: true }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const newActive = !user.isActive;

      // Actualizar tabla User y sus tablas asociadas student / teacher isEnabled
      await prisma.user.update({
        where: { id },
        data: { isActive: newActive }
      });

      if (user.student) {
        await prisma.student.update({
          where: { id: user.student.id },
          data: { isEnabled: newActive }
        });
      }

      if (user.teacher) {
        await prisma.teacher.update({
          where: { id: user.teacher.id },
          data: { isEnabled: newActive }
        });
      }

      await prisma.auditLog.create({
        data: {
          userId: req.user.userId,
          action: 'TOGGLE_USER_STATUS',
          ipAddress: req.ip,
          details: { targetUserId: id, newActive }
        }
      });

      res.json({ message: `Estado del usuario actualizado a ${newActive ? 'Habilitado' : 'Deshabilitado'}`, isActive: newActive });
    } catch (error) {
      console.error('Error toggling user status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new UserController();