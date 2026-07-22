const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_for_development_only';

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          student: true,
          teacher: true
        }
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Invalid credentials or inactive user' });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if user has already voted
      if (user.role !== 'ADMIN') {
        const hasVoted = await prisma.credential.findFirst({
          where: {
            userId: user.id,
            usedAt: { not: null }
          }
        });

        if (hasVoted) {
          return res.status(403).json({ error: 'Ya has emitido tu voto en el sistema. No puedes ingresar nuevamente.' });
        }
      }

      // Generate JWT
      const token = jwt.sign(
        { 
          userId: user.id, 
          role: user.role, 
          email: user.email 
        },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      // Audit Log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          ipAddress: req.ip,
          userAgent: req.get('user-agent') || 'Unknown',
          details: { role: user.role }
        }
      });

      let profileData = null;
      if (user.role === 'STUDENT' && user.student) {
        profileData = { ...user.student };
      } else if (user.role === 'TEACHER' && user.teacher) {
        profileData = { ...user.teacher };
      }

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: profileData
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async me(req, res) {
    try {
      // req.user is set by auth middleware
      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          student: true,
          teacher: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let profileData = null;
      if (user.role === 'STUDENT' && user.student) {
        profileData = { ...user.student };
      } else if (user.role === 'TEACHER' && user.teacher) {
        profileData = { ...user.teacher };
      }

      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        profile: profileData
      });
    } catch (error) {
      console.error('Me error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new AuthController();