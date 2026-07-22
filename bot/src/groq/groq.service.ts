import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);
  private groq: Groq | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (apiKey) {
      this.groq = new Groq({ apiKey });
    } else {
      this.logger.warn('GROQ_API_KEY no configurado. El asistente IA utilizará respuestas predeterminadas.');
    }
  }

  async generateResponse(userMessage: string): Promise<string> {
    if (!this.groq) {
      return '🤖 **Asistente Virtual NextVote**\n\n' +
             'Hola, soy el bot asistente para las Elecciones Universitarias UNT.\n\n' +
             'Comandos disponibles:\n' +
             '• `/vote` - Emitir voto anónimo\n' +
             '• `/resultados` - Ver conteo ponderado de votos\n' +
             '• `/verificar` - Validar integridad de la cadena de bloques';
    }

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Eres el asistente oficial del Sistema de Votación Digital Universitario NextVote de la Universidad Nacional de Trujillo (UNT).
Responde amablemente en español a las consultas sobre las elecciones, ponderación de votos (docentes x3, estudiantes x1), y sobre cómo se garantiza el anonimato criptográfico mediante la cadena de bloques.
Mantén tus respuestas breves y directas.`,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        model: 'llama-3.3-70b-versatile',
      });

      return completion.choices[0]?.message?.content || 'No pude procesar tu solicitud en este momento.';
    } catch (error) {
      this.logger.error('Error al llamar a Groq API', error);
      return 'Lo siento, el asistente virtual no está disponible temporalmente.';
    }
  }
}
