# Sistema Oficial de Votaciones Digitales (NextVote UNT)

Este proyecto es una simulación de un sistema de votación digital seguro y anónimo diseñado para la Universidad Nacional de Trujillo, implementando conceptos de tecnología Blockchain para garantizar la integridad y transparencia del proceso electoral.

## Tecnologías Utilizadas

- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios.
- **Backend:** Node.js, Express, Prisma ORM.
- **Base de Datos:** PostgreSQL.
- **Infraestructura:** Docker & Docker Compose.

## Características Principales

1. **Voto Anónimo:** Desacople criptográfico entre la identidad del votante (estudiante/docente) y su voto a través de la emisión silenciosa de tokens anónimos.
2. **Redirección Directa e Inmediata:** Al iniciar sesión como estudiante o docente, el usuario ingresa inmediatamente al proceso electoral activo.
3. **Cierre de Sesión Automático (10s):** Al registrar exitosamente un voto en la cadena de bloques, se inicia una cuenta regresiva de 10 segundos para cerrar la sesión por motivos de seguridad.
4. **Panel de Administración y CRUDs:** Gestión integral del proceso por el rol `ADMIN` (Creación/edición de elecciones, alta de candidatos, visualización del padrón electoral y consulta de logs de auditoría).
5. **Blockchain (Simulado):** Los votos se registran en una cadena de bloques inmutable (Ledger) con validación de hash anterior y merkle root.
6. **Ponderación de Votos:** Los votos de los docentes tienen un mayor peso (x3) que los de los estudiantes (x1).
7. **Ruido Criptográfico (Dummy Traffic):** Inyección de votos falsos (ruido) que ofuscan el tráfico real sin alterar el conteo oficial.
8. **Auditoría Transparente:** Explorador de bloques interactivo para verificar la integridad matemática y criptográfica de la cadena.

## Requisitos Previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y ejecutándose.
- Git.

## Instalación y Despliegue con Docker

La forma más sencilla de ejecutar el proyecto completo (Base de Datos + Backend + Frontend) es usando Docker Compose.

1. **Clona el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd proyecto-votacion
   ```

2. **Levantar los contenedores**
   ```bash
   docker-compose up -d --build
   ```

3. **Ejecutar las migraciones y semillar la base de datos (IMPORTANTE)**
   Una vez que los contenedores estén corriendo, debes inicializar la base de datos con el padrón electoral de prueba:
   ```bash
   docker exec -it nextvote-backend npx prisma db push
   docker exec -it nextvote-backend npm run seed
   ```

4. **Acceder a la aplicación**
   - **Frontend (Interfaz Gráfica):** [http://localhost:8080](http://localhost:8080) (Puerto 8080)
   - **Backend (API):** [http://localhost:3000/api](http://localhost:3000/api)

## Credenciales de Prueba

Una vez ejecutado el comando de seed, puedes usar las siguientes credenciales para probar el sistema:

- **Administrador:** `admin@unitru.edu.pe` / Contraseña: `admin123`
- **Docentes:** `carlos.mendoza@unitru.edu.pe`, `maria.torres@unitru.edu.pe` / Contraseña: `docente123`
- **Estudiantes:** `juan.quispe@unitru.edu.pe`, `ana.flores@unitru.edu.pe` / Contraseña: `estudiante123`

## Comandos Útiles

- **Ver logs del backend:** `docker logs -f nextvote-backend`
- **Generar tráfico simulado (Dummy Votes) en tiempo real:**
  ```bash
  # Cambia <election_id> por el ID (UUID) de una elección activa
  docker exec -it nextvote-backend npm run dummy <election_id>
  ```
- **Detener el sistema:** `docker-compose down`
