import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, GatewayIntentBits, Partials, Events, REST, Routes, Message, MessageFlags } from 'discord.js';
import { GroqService } from '../groq/groq.service';
import { VotingService } from '../voting/voting.service';

@Injectable()
export class DiscordService implements OnModuleInit {
  private readonly logger = new Logger(DiscordService.name);
  private client: Client;

  constructor(
    private configService: ConfigService,
    private groqService: GroqService,
    private votingService: VotingService,
  ) {}

  async onModuleInit() {
    const token = this.configService.get<string>('DISCORD_BOT_TOKEN');
    if (!token) {
      this.logger.warn('DISCORD_BOT_TOKEN no está definido. El bot de Discord no se iniciará.');
      return;
    }

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
      ],
      partials: [Partials.Channel],
    });

    this.client.once(Events.ClientReady, async (readyClient) => {
      this.logger.log(`Bot de Discord autenticado exitosamente como: ${readyClient.user.tag}`);
      await this.registerCommands(token, readyClient.user.id);
    });

    this.client.on(Events.InteractionCreate, async (interaction) => {
      // 1. Autocomplete for candidates
      if (interaction.isAutocomplete()) {
        if (interaction.commandName === 'vote') {
          const focusedValue = interaction.options.getFocused();
          const candidates = await this.votingService.getCandidates(focusedValue);
          await interaction.respond(
            candidates.slice(0, 25).map(c => ({
              name: `Lista ${c.listNumber}: ${c.fullName} (${c.politicalMovement || 'Independiente'})`,
              value: c.id
            }))
          );
        }
        return;
      }

      if (!interaction.isChatInputCommand()) return;

      // 2. Handle /vote command
      if (interaction.commandName === 'vote') {
        if (interaction.guildId) {
          await interaction.reply({
            content: '⚠️ **La votación solo está permitida por Mensaje Directo (DM)** para garantizar tu privacidad y evitar filtraciones de credenciales. ¡Por favor envíame un mensaje directo!',
            flags: MessageFlags.Ephemeral
          });
          return;
        }

        const email = interaction.options.getString('email', true);
        const password = interaction.options.getString('password', true);
        const candidateId = interaction.options.getString('candidato', true);

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
          const result = await this.votingService.castVote(email, password, candidateId);
          await interaction.editReply({ content: result });
        } catch (error: any) {
          await interaction.editReply({ content: `❌ Error al votar: ${error.message}` });
        }
      }

      // 3. Handle /resultados command
      if (interaction.commandName === 'resultados') {
        await interaction.deferReply();
        const results = await this.votingService.getResults();
        await interaction.editReply({ content: results });
      }

      // 4. Handle /verificar command
      if (interaction.commandName === 'verificar') {
        await interaction.deferReply();
        const verification = await this.votingService.verifyIntegrity();
        await interaction.editReply({ content: verification });
      }
    });

    // Handle Direct Messages for Q&A Assistant
    this.client.on(Events.MessageCreate, async (message: Message) => {
      if (message.author.bot) return;
      if (message.guildId) return; // Only process DMs

      try {
        const response = await this.groqService.generateResponse(message.content);
        await message.reply(response);
      } catch (error) {
        this.logger.error('Error al responder mensaje en Discord', error);
      }
    });

    await this.client.login(token);
  }

  private async registerCommands(token: string, clientId: string) {
    const rest = new REST({ version: '10' }).setToken(token);

    const commands = [
      {
        name: 'vote',
        description: 'Emitir voto anónimo en la elección activa',
        options: [
          {
            name: 'email',
            description: 'Tu correo institucional (@unitru.edu.pe)',
            type: 3, // STRING
            required: true,
          },
          {
            name: 'password',
            description: 'Tu contraseña de NextVote',
            type: 3, // STRING
            required: true,
          },
          {
            name: 'candidato',
            description: 'Selecciona al candidato por el que deseas votar',
            type: 3, // STRING
            required: true,
            autocomplete: true,
          },
        ],
      },
      {
        name: 'resultados',
        description: 'Consultar los resultados y conteo ponderado de votos en tiempo real',
      },
      {
        name: 'verificar',
        description: 'Verificar la integridad matemática y criptográfica de la cadena de bloques',
      },
    ];

    try {
      this.logger.log('Registrando comandos Slash de Discord...');
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      this.logger.log('Comandos de Discord recargados exitosamente.');
    } catch (error) {
      this.logger.error('Error al registrar comandos en Discord', error);
    }
  }
}
