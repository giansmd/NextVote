# NextVote - Backend API

Esta es la API REST de **NextVote**, un Sistema de Votación Digital Universitaria con Simulación Blockchain y Contratos Inteligentes.

## Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/)
- [PostgreSQL](https://www.postgresql.org/) (opcional, si decides correrlo sin Docker)

## Configuración y Variables de Entorno

Crea un archivo `.env` en el directorio `backend` basado en el archivo `.env.example`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nextvote?schema=public"
PORT=3000
JWT_SECRET="supersecret_for_development_only"
ENCRYPTION_KEY="12345678901234567890123456789012"
```

> **Nota:** La clave `ENCRYPTION_KEY` debe tener exactamente 32 caracteres (256 bits) para soportar el cifrado AES-256-CBC.

## Ejecución Local (Desarrollo)

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Generar cliente de Prisma y ejecutar migraciones**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Ejecutar el script de siembra (seed)**:
   ```bash
   npm run seed
   ```

4. **Iniciar el servidor en modo desarrollo**:
   ```bash
   npm run dev
   ```

## Ejecución con Docker Compose

Puedes levantar toda la infraestructura (Base de Datos PostgreSQL y Servidor Backend) usando Docker Compose desde la raíz del proyecto:

1. **Levantar contenedores**:
   ```bash
   docker-compose up --build -d
   ```

2. **Ejecutar migraciones y seed dentro del contenedor de backend**:
   ```bash
   docker exec -it nextvote-backend npx prisma db push
   docker exec -it nextvote-backend npm run seed
   ```

## Endpoints Principales

- **Autenticación**: `POST /api/auth/login`, `GET /api/auth/me`
- **Elecciones**: `GET /api/elections`, `GET /api/elections/:id`, `POST /api/elections`, `PUT /api/elections/:id`, `POST /api/elections/:id/start`, `POST /api/elections/:id/finish`, `POST /api/elections/:id/cancel`
- **Candidatos**: `GET /api/candidates/election/:electionId`, `POST /api/candidates`, `PUT /api/candidates/:id`, `PATCH /api/candidates/:id/toggle`, `DELETE /api/candidates/:id`
- **Usuarios / Padrón**: `GET /api/users`, `POST /api/users/import`, `PATCH /api/users/:id/toggle`
- **Votación**:
  - `GET /api/voting/:electionId/credential` (Emisión/Regeneración de token anónimo para votantes no habidos)
  - `POST /api/voting/submit` (Envío y registro del voto anónimo en la cadena)
  - `GET /api/voting/:electionId/status` (Verificación de estado de emisión de voto)
- **Blockchain**:
  - `GET /api/blockchain/:electionId/blocks` (Explorador de bloques de la cadena)
  - `GET /api/blockchain/:electionId/verify` (Auditoría e inspección de integridad criptográfica)
  - `GET /api/blockchain/:electionId/results` (Conteo oficial de votos ponderados)
- **Auditoría**: `GET /api/audit` (Logs de actividades del sistema)
