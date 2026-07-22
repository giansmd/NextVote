# NextVote - Bot de Discord Asistente y Votación

Este subproyecto contiene el **Bot de Discord Oficial de NextVote**, desarrollado con **NestJS** y **discord.js v14**. Permite a los electores universitarios consultar candidatos, emitir su voto anónimo de forma directa y privada (vía DM), consultar los resultados ponderados en tiempo real y verificar la integridad de la cadena de bloques.

---

## 🚀 Características Principales

1. **Votación Anónima por Mensajes Directos (`/vote`):**
   - Para garantizar el anonimato y evitar la exposición de credenciales en canales públicos, la votación se realiza exclusivamente vía Mensaje Directo (DM) o respuestas efímeras.
   - Cuenta con **autocompletado dinámico** de candidatos desde la base de datos de la elección activa.
   - Retorna el **Hash de Bloque** generado por la Blockchain simulada como comprobante criptográfico.

2. **Resultados Ponderados en Tiempo Real (`/resultados`):**
   - Muestra los puntos acumulados considerando la ponderación institucional (Docentes x3, Estudiantes x1).

3. **Auditoría e Integridad de Blockchain (`/verificar`):**
   - Ejecuta una inspección matemática de los hashes y enlaces entre bloques (incluyendo la detección de bloques de ruido/dummy).

4. **Asistente Virtual con IA (Groq):**
   - Responde preguntas frecuentes de los usuarios por DM acerca de las reglas electorales, anonimato y ponderación.

---

## 🛠️ Configuración y Requisitos Previos

### 1. Crear una Aplicación en Discord Developer Portal

1. Ve a [Discord Developer Portal](https://discord.com/developers/applications).
2. Haz clic en **New Application**, asígnale el nombre `NextVote Bot`.
3. Ve a la sección **Bot**:
   - Haz clic en **Reset Token** para obtener tu `DISCORD_BOT_TOKEN`.
   - Activa los **Privileged Gateway Intents**:
     - ✅ **PRESENCE INTENT**
     - ✅ **SERVER MEMBERS INTENT**
     - ✅ **MESSAGE CONTENT INTENT**
4. Ve a **OAuth2 -> URL Generator**:
   - Selecciona los scopes: `bot`, `applications.commands`.
   - Selecciona los permisos de bot: `Send Messages`, `Read Message History`, `Use Slash Commands`.
   - Copia la URL generada e invita al bot a tu servidor de prueba de Discord.

---

## 📋 Variables de Entorno

Crea un archivo `.env` en la carpeta `bot/` tomando como base `.env.example`:

```env
# Token obtenido desde Discord Developer Portal
DISCORD_BOT_TOKEN=tu_token_de_discord_aqui

# URL de la API Backend de NextVote
API_URL=http://localhost:3000/api

# (Opcional) Clave de la API de Groq para el asistente IA
GROQ_API_KEY=tu_groq_api_key_opcional
```

---

## 💻 Ejecución Local (Desarrollo)

```bash
# 1. Navega a la carpeta del bot
cd bot

# 2. Instala las dependencias
npm install

# 3. Inicia el bot en modo desarrollo
npm run start:dev
```

---

## 🐳 Ejecución con Docker Compose

El bot se encuentra integrado en el archivo `docker-compose.yml` de la raíz del proyecto. Para levantarlo junto al backend, frontend y base de datos:

```bash
# Desde la raíz del proyecto
docker-compose up -d --build bot
```

---

## 🤖 Comandos Slash Disponibles en Discord

| Comando | Parámetros | Descripción |
| :--- | :--- | :--- |
| `/vote` | `email`, `password`, `candidato` | Emite un voto anónimo en la elección activa (Solo en DM). |
| `/resultados` | `eleccion` (opcional) | Consulta los resultados en tiempo real de una elección específica o la primera elección activa si no se proporciona ninguna. Muestra el conteo de puntos ponderados acumulados por cada candidato en función de los votos reales emitidos. |
| `/verificar` | `eleccion` (opcional) | Audita e inspecciona la integridad matemática de la Blockchain para una elección específica o la primera elección activa. Verifica los enlaces criptográficos de los bloques y detecta anomalías. |

---

## 🛡️ Seguridad y Privacidad

- El bot **nunca guarda credenciales en memoria ni logs**.
- Toda interacción de inicio de sesión se realiza mediante peticiones HTTPS efímeras hacia la API de NextVote.
- Los tokens anónimos emitidos son hash SHA-256 de uso único desacoplados de la identidad del votante.
