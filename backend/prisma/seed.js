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

  const student3User = await prisma.user.create({
    data: {
      email: 'gsamana@unitru.edu.pe',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      isActive: true,
      student: {
        create: {
          studentCode: 'EST-2023-2012',
          fullName: 'Gian Franco Miguel Gonzalo Samana Ramirez',
          faculty: 'Facultad de Ingeniería',
          school: 'Escuela de Ingeniería de Sistemas',
          institutionalEmail: 'gsamana@unitru.edu.pe'
        }
      }
    }
  });
  console.log('✅ Usuarios Estudiantes creados (juan.quispe, ana.flores, gsamana / estudiante123)');

  // 4. Crear Elección General (21 al 22 de Julio 2026)
  const startDate = new Date('2026-07-21T08:00:00Z');
  const endDate = new Date('2026-07-22T18:00:00Z');

  // ELECCIÓN 1: Rectoría UNT (Estudiantes y Docentes - Letras)
  const electionRector = await prisma.election.create({
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
            listNumber: 'A',
            politicalMovement: 'Frente de Innovación Académica (FIA)',
            position: 'Rector',
            workPlan: '1. Modernización de laboratorios de IA y Blockchain.\n2. Digitalización de trámites.\n3. Becas de investigación internacional.'
          },
          {
            fullName: 'Dra. Beatriz Alva Guerrero',
            photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
            listNumber: 'B',
            politicalMovement: 'Movimiento Autonomía y Progreso (MAP)',
            position: 'Rector',
            workPlan: '1. Transparencia presupuestal total.\n2. Mejora del comedor y transporte universitario.\n3. Convenios laborales con empresas tech.'
          },
          {
            fullName: 'Dr. Julio C. Rojas Méndez',
            photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
            listNumber: 'C',
            politicalMovement: 'Unidad y Transparencia Universitaria (UTU)',
            position: 'Rector',
            workPlan: '1. Internacionalización de la UNT.\n2. Acreditación de todas las carreras.\n3. Incubadoras de startups para alumnos.'
          }
        ]
      }
    }
  });
  console.log(`✅ Elección activa creada: "${electionRector.name}"`);

  // ELECCIÓN 2: Decanato de Ingeniería (Estudiantes y Docentes de Ingeniería - Letras)
  const electionDecanoIng = await prisma.election.create({
    data: {
      name: 'Elección de Decano - Facultad de Ingeniería 2026-2030',
      description: 'Elección para la Decanatura de la Facultad de Ingeniería de la UNT.',
      academicPeriod: '2026-II',
      category: 'Decanato',
      faculty: 'Facultad de Ingeniería',
      startDate,
      startTime: '08:00',
      endDate,
      endTime: '18:00',
      status: 'ACTIVE',
      createdBy: admin.id,
      candidates: {
        create: [
          {
            fullName: 'Dr. Eduardo López Chang',
            photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
            listNumber: 'A',
            politicalMovement: 'Ingeniería del Futuro (IF)',
            position: 'Decano',
            workPlan: '1. Nuevos pabellones y equipamiento tecnológico.\n2. Integración con el Silicon Valley peruano.\n3. Rediseño curricular centrado en habilidades blandas.'
          },
          {
            fullName: 'Dra. Patricia Benites Flores',
            photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
            listNumber: 'B',
            politicalMovement: 'Sinergia de Ingeniería (SI)',
            position: 'Decano',
            workPlan: '1. Impulso a proyectos de investigación aplicada.\n2. Inclusión y equidad de género en carreras STEM.\n3. Modernización administrativa.'
          }
        ]
      }
    }
  });
  console.log(`✅ Elección activa creada: "${electionDecanoIng.name}"`);

  // ELECCIÓN 3: Consejo de Facultad - Estudiantes de Ingeniería (Solo Estudiantes de Ingeniería - Números)
  const electionCFEst = await prisma.election.create({
    data: {
      name: 'Representantes Estudiantes ante Consejo de Facultad - Ingeniería',
      description: 'Elección de representantes de los estudiantes ante el Consejo de la Facultad de Ingeniería.',
      academicPeriod: '2026-II',
      category: 'Consejo de Facultad - Estudiantes',
      faculty: 'Facultad de Ingeniería',
      startDate,
      startTime: '08:00',
      endDate,
      endTime: '18:00',
      status: 'ACTIVE',
      createdBy: admin.id,
      candidates: {
        create: [
          {
            fullName: 'Est. Kevin Cerna Rosas',
            photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6',
            listNumber: '1',
            politicalMovement: 'Movimiento de Integración de Sistemas (MIS)',
            position: 'Representante Estudiantil',
            workPlan: '1. Bolsa de prácticas pre-profesionales.\n2. Tutorías estudiantiles.\n3. Mayor participación en decisiones del Consejo.'
          },
          {
            fullName: 'Est. Sofía Medina Castro',
            photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
            listNumber: '2',
            politicalMovement: 'Vanguardia Tecnológica Estudiantil (VTE)',
            position: 'Representante Estudiantil',
            workPlan: '1. Talleres gratuitos de programación.\n2. Modernización de salas de estudio.\n3. Presupuesto participativo estudiantil.'
          },
          {
            fullName: 'Est. Diego Vera López',
            photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
            listNumber: '3',
            politicalMovement: 'Alianza de Ingeniería y Software (AIS)',
            position: 'Representante Estudiantil',
            workPlan: '1. Renovación de convenios con software libre.\n2. Ferias tecnológicas semestrales.\n3. Mayor transparencia del consejo.'
          }
        ]
      }
    }
  });
  console.log(`✅ Elección activa creada: "${electionCFEst.name}"`);

  // ELECCIÓN 4: Consejo de Facultad - Docentes de Ingeniería (Solo Docentes de Ingeniería - Números)
  const electionCFDoc = await prisma.election.create({
    data: {
      name: 'Representantes Docentes ante Consejo de Facultad - Ingeniería',
      description: 'Elección de representantes docentes ante el Consejo de la Facultad de Ingeniería.',
      academicPeriod: '2026-II',
      category: 'Consejo de Facultad - Docentes',
      faculty: 'Facultad de Ingeniería',
      startDate,
      startTime: '08:00',
      endDate,
      endTime: '18:00',
      status: 'ACTIVE',
      createdBy: admin.id,
      candidates: {
        create: [
          {
            fullName: 'Dr. Walter Torres Paz',
            photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
            listNumber: '1',
            politicalMovement: 'Unión Científica de Ingeniería (UCI)',
            position: 'Representante Docente',
            workPlan: '1. Fondos concursables para publicaciones científicas.\n2. Capacitación docente en herramientas digitales.\n3. Escalafón y estabilidad docente.'
          },
          {
            fullName: 'Dra. Elena Ruiz Castillo',
            photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
            listNumber: '2',
            politicalMovement: 'Renovación Académica de Ingeniería (RAI)',
            position: 'Representante Docente',
            workPlan: '1. Flexibilidad de horarios para investigación.\n2. Modernización de salas de profesores.\n3. Apoyo a la docencia virtual y semipresencial.'
          }
        ]
      }
    }
  });
  console.log(`✅ Elección activa creada: "${electionCFDoc.name}"`);

  // ELECCIÓN 5: Asamblea Universitaria - Estudiantes (Solo Estudiantes - Letras)
  const electionAUEst = await prisma.election.create({
    data: {
      name: 'Representantes Estudiantes ante Asamblea Universitaria - Pregrado y Posgrado',
      description: 'Elección de representantes estudiantiles ante la Asamblea Universitaria de la UNT.',
      academicPeriod: '2026-II',
      category: 'Asamblea Universitaria - Estudiantes',
      startDate,
      startTime: '08:00',
      endDate,
      endTime: '18:00',
      status: 'ACTIVE',
      createdBy: admin.id,
      candidates: {
        create: [
          {
            fullName: 'Est. Valeria Chávez Ríos',
            photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
            listNumber: 'A',
            politicalMovement: 'Coalición Estudiantil UNT (CEUNT)',
            position: 'Asambleísta Estudiantil',
            workPlan: '1. Reforma del estatuto para mayor representatividad.\n2. Fiscalización de la calidad académica en filiales.\n3. Apoyo a deportistas destacados.'
          },
          {
            fullName: 'Est. Andrés Silva Portal',
            photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce',
            listNumber: 'B',
            politicalMovement: 'Frente de Unidad de Estudiantes (FUE)',
            position: 'Asambleísta Estudiantil',
            workPlan: '1. Defensoría universitaria estudiantil autónoma.\n2. Ampliación del comedor universitario.\n3. Digitalización de trámites de titulación.'
          }
        ]
      }
    }
  });
  console.log(`✅ Elección activa creada: "${electionAUEst.name}"`);

  // ELECCIÓN 6: Asamblea Universitaria - Docentes (Solo Docentes - Letras)
  const electionAUDoc = await prisma.election.create({
    data: {
      name: 'Representantes Docentes ante Asamblea Universitaria - UNT',
      description: 'Elección de representantes docentes ante la Asamblea Universitaria de la UNT.',
      academicPeriod: '2026-II',
      category: 'Asamblea Universitaria - Docentes',
      startDate,
      startTime: '08:00',
      endDate,
      endTime: '18:00',
      status: 'ACTIVE',
      createdBy: admin.id,
      candidates: {
        create: [
          {
            fullName: 'Dr. Javier Aguilar Vargas',
            photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
            listNumber: 'A',
            politicalMovement: 'Consenso de Docentes de la UNT (CD-UNT)',
            position: 'Asambleísta Docente',
            workPlan: '1. Promoción a docentes investigadores.\n2. Plan nacional de capacitación.\n3. Mejora salarial permanente.'
          },
          {
            fullName: 'Dra. Rosa Miranda Rojas',
            photoUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4',
            listNumber: 'B',
            politicalMovement: 'Acción Académica y Docente (AAD)',
            position: 'Asambleísta Docente',
            workPlan: '1. Evaluación del plan estratégico institucional.\n2. Digitalización de repositorios académicos.\n3. Bienestar y salud docente.'
          }
        ]
      }
    }
  });
  console.log(`✅ Elección activa creada: "${electionAUDoc.name}"`);

  // ELECCIÓN 7: Consejo Universitario - Estudiantes (Solo Estudiantes - Letras)
  const electionCUEst = await prisma.election.create({
    data: {
      name: 'Representantes Estudiantes ante Consejo Universitario - UNT',
      description: 'Elección de representantes estudiantiles ante el Consejo Universitario de la UNT.',
      academicPeriod: '2026-II',
      category: 'Consejo Universitario - Estudiantes',
      startDate,
      startTime: '08:00',
      endDate,
      endTime: '18:00',
      status: 'ACTIVE',
      createdBy: admin.id,
      candidates: {
        create: [
          {
            fullName: 'Est. Gabriel Tello López',
            photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61',
            listNumber: 'A',
            politicalMovement: 'Representación Estudiantil Independiente (REI)',
            position: 'Consejero Universitario Estudiantil',
            workPlan: '1. Gestión de convenios de prácticas internacionales.\n2. Mayor presupuesto para investigación estudiantil.\n3. Modernización del centro de idiomas.'
          },
          {
            fullName: 'Est. Natalia Obando Ortiz',
            photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
            listNumber: 'B',
            politicalMovement: 'Movimiento Estudiantil Reformista (MER)',
            position: 'Consejero Universitario Estudiantil',
            workPlan: '1. Renovación de bibliotecas virtuales.\n2. Bolsa de trabajo y convenios internacionales.\n3. Subvención a congresos nacionales.'
          }
        ]
      }
    }
  });
  console.log(`✅ Elección activa creada: "${electionCUEst.name}"`);

  // ELECCIÓN 8: Departamento Académico - Ciencias de la Computación (Solo Docentes - Números)
  const electionDAIng = await prisma.election.create({
    data: {
      name: 'Elección de Director de Departamento - Ciencias de la Computación',
      description: 'Elección de Director del Departamento Académico de Ciencias de la Computación de la Facultad de Ingeniería.',
      academicPeriod: '2026-II',
      category: 'Departamento Académico',
      faculty: 'Facultad de Ingeniería',
      school: 'Ciencias de la Computación',
      startDate,
      startTime: '08:00',
      endDate,
      endTime: '18:00',
      status: 'ACTIVE',
      createdBy: admin.id,
      candidates: {
        create: [
          {
            fullName: 'Dr. Fernando Soto Medina',
            photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
            listNumber: '1',
            politicalMovement: 'Innovación y Computación (IC)',
            position: 'Director de Departamento',
            workPlan: '1. Implementación de servidores de GPU y laboratorios avanzados.\n2. Certificaciones internacionales de calidad académica.\n3. Rediseño de mallas curriculares.'
          },
          {
            fullName: 'Dra. Liliana Ramos Zavaleta',
            photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
            listNumber: '2',
            politicalMovement: 'Desarrollo de la Ciencia de Computación (DCC)',
            position: 'Director de Departamento',
            workPlan: '1. Fomento de semilleros de investigación.\n2. Vinculación activa con la industria tecnológica global.\n3. Mayor capacitación en IA para docentes.'
          }
        ]
      }
    }
  });
  console.log(`✅ Elección activa creada: "${electionDAIng.name}"`);


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