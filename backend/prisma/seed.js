const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando la siembra de la base de datos (Seed)...');

  // Limpiar datos existentes (opcional para reinicios limpios)
  await prisma.auditLog.deleteMany({});
  await prisma.block.deleteMany({});
  await prisma.credential.deleteMany({});
  await prisma.candidate.deleteMany({});
  await prisma.election.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Crear Administrador Electoral
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@unitru.edu.pe',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true
    }
  });
  console.log('✅ Usuario Administrador creado: admin@unitru.edu.pe / admin123');

  // 2. Crear Docentes
  const teacherPasswordHash = await bcrypt.hash('docente123', 10);
  
  const teacher1User = await prisma.user.create({
    data: {
      email: 'carlos.mendoza@unitru.edu.pe',
      passwordHash: teacherPasswordHash,
      role: 'TEACHER',
      isActive: true,
      teacher: {
        create: {
          teacherCode: 'DOC-2024-001',
          fullName: 'Dr. Carlos Mendoza Paredes',
          faculty: 'Facultad de Ingeniería',
          department: 'Ciencias de la Computación',
          institutionalEmail: 'carlos.mendoza@unitru.edu.pe'
        }
      }
    }
  });

  const teacher2User = await prisma.user.create({
    data: {
      email: 'maria.torres@unitru.edu.pe',
      passwordHash: teacherPasswordHash,
      role: 'TEACHER',
      isActive: true,
      teacher: {
        create: {
          teacherCode: 'DOC-2024-002',
          fullName: 'Dra. María Torres Gómez',
          faculty: 'Facultad de Ciencias Sociales',
          department: 'Derecho y Ciencias Políticas',
          institutionalEmail: 'maria.torres@unitru.edu.pe'
        }
      }
    }
  });
  console.log('✅ Usuarios Docentes creados (carlos.mendoza@unitru.edu.pe, maria.torres@unitru.edu.pe / docente123)');

  // 3. Crear Estudiantes
  const studentPasswordHash = await bcrypt.hash('estudiante123', 10);

  const student1User = await prisma.user.create({
    data: {
      email: 'juan.quispe@unitru.edu.pe',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      isActive: true,
      student: {
        create: {
          studentCode: 'EST-2022-1045',
          fullName: 'Juan Quispe Silva',
          faculty: 'Facultad de Ingeniería',
          school: 'Escuela de Ingeniería de Sistemas',
          institutionalEmail: 'juan.quispe@unitru.edu.pe'
        }
      }
    }
  });

  const student2User = await prisma.user.create({
    data: {
      email: 'ana.flores@unitru.edu.pe',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      isActive: true,
      student: {
        create: {
          studentCode: 'EST-2023-2011',
          fullName: 'Ana Flores Mamani',
          faculty: 'Facultad de Ingeniería',
          school: 'Escuela de Ingeniería Software',
          institutionalEmail: 'ana.flores@unitru.edu.pe'
        }
      }
    }
  });
  console.log('✅ Usuarios Estudiantes creados (juan.quispe, ana.flores / estudiante123)');

  // 4. Crear Elección General (21 al 22 de Julio 2026)
  const startDate = new Date('2026-07-21T08:00:00Z');
  const endDate = new Date('2026-07-22T18:00:00Z');

  const election = await prisma.election.create({
    data: {
      name: 'Elección de Rectoría UNT 2026-2030',
      description: 'Elección general universitaria para la selección del nuevo Rector y Vicerrectores de la Universidad Nacional de Trujillo.',
      academicPeriod: '2026-II',
      category: 'Rectoría',
      startDate,
      startTime: '08:00',
      endDate,
      endTime: '18:00',
      status: 'ACTIVE',
      createdBy: admin.id,
      candidates: {
        create: [
          {
            fullName: 'Dr. Hugo Morales Ramos',
            photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a',
            listNumber: '1',
            politicalMovement: 'Frente de Innovación Académica (FIA)',
            position: 'Rector',
            workPlan: '1. Modernización de laboratorios de IA y Blockchain.\n2. Digitalización de trámites.\n3. Becas de investigación internacional.'
          },
          {
            fullName: 'Dra. Beatriz Alva Guerrero',
            photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
            listNumber: '2',
            politicalMovement: 'Movimiento Autonomía y Progreso (MAP)',
            position: 'Rector',
            workPlan: '1. Transparencia presupuestal total.\n2. Mejora del comedor y transporte universitario.\n3. Convenios laborales con empresas tech.'
          }
        ]
      }
    }
  });
  console.log(`✅ Elección de prueba activa creada: "${election.name}" (ID: ${election.id})`);

  console.log('🎉 Siembra de datos completada exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la siembra de la base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });