# NextVote - Frontend Interface

Interfaz web de usuario desarrollada con **React**, **Vite** y **Tailwind CSS** para el Sistema de Votación Digital Universitaria de la Universidad Nacional de Trujillo (UNT).

## Tecnologías Utilizadas

- **React 18** + **Vite** (Desarrollo y empaquetado ultra rápido)
- **Tailwind CSS** (Diseño moderno, limpio y profesional con paletas institucionales)
- **React Router DOM v6** (Navegación SPA)
- **Lucide React** (Iconografía moderna)
- **Axios** (Cliente HTTP para interacción con la API Backend)

## Vistas y Funcionalidades

1. **Autenticación (Login):**
   - Validación de credenciales institucionales (@unitru.edu.pe).
   - Redirección inteligente: los votantes (docentes y estudiantes) acceden directamente al proceso electoral activo, mientras que los administradores ingresan al panel de control (`/admin`).

2. **Entorno Seguro de Votación (`/vote/:id`):**
   - Obtención silenciosa del token anónimo de votante.
   - Presentación visual de candidatos con planes de trabajo.
   - Confirmación en modal antes de la firma criptográfica del voto.
   - **Cierre de sesión automático (10s):** Al registrar exitosamente el voto, inicia un conteo regresivo de 10 segundos tras el cual el usuario es desconectado automáticamente por motivos de seguridad.

3. **Panel de Administración (`/admin`):**
   - **Gestión de Elecciones:** Creación de procesos electorales, inicio y finalización del evento en tiempo real.
   - **Gestión de Candidatos:** Formulario modal para el alta de listas, postulantes y propuestas.
   - **Padrón de Electores:** Consulta tabular de docentes, estudiantes y administradores registrados.
   - **Auditoría e Historial:** Registro detallado de logs de actividad e IP.

4. **Explorador Blockchain y Resultados (`/blockchain/:id`):**
   - Conteo ponderado de votos en tiempo real (Docentes x3, Estudiantes x1).
   - Verificación visual de integridad de la cadena de bloques.
   - Visualizador de bloques individuales con hashes, transacciones y bloques dummy de ruido.

## Comandos para Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar bundle de producción
npm run build
```
