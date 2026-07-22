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
      this.logger.warn('DISCORD_BOT_TOKEN is not defined. Discord bot will not start.');
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
      this.logger.log(`Discord bot logged in as ${readyClient.user.tag}`);
      await this.registerCommands(token, readyClient.user.id);
    });

    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (interaction.isAutocomplete()) {
        if (interaction.commandName === 'vote') {
          const focusedValue = interaction.options.getFocused();
          const candidates = await this.votingService.getCandidates(focusedValue);
          await interaction.respond(
            candidates.slice(0, 25).map(c => ({ name: `${c.nombre} ${c.apellido}`, value: c.id }))
          );
        }
        return;
      }

      if (!interaction.isChatInputCommand()) return;

      if (interaction.commandName === 'vote') {
        if (interaction.guildId) {
          await interaction.reply({ content: 'Voting is only permitted in Direct Messages to protect your anonymity. Please send me a DM!', flags: MessageFlags.Ephemeral });
          return;
        }
        const identificador = interaction.options.getString('identificador', true);
        const password = interaction.options.getString('password', true);
        const candidateId = interaction.options.getString('candidate_id', true);

        // Ephemeral messages are only visible to the user who invoked the command
        // and disappear on client reload, ensuring privacy.
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
          const result = await this.votingService.castVote(identificador, password, candidateId);
          await interaction.editReply({ content: result });
        } catch (error: any) {
          await interaction.editReply({ content: `Voting failed: ${error.message}` });
        }
      }
    });

    this.client.on(Events.MessageCreate, async (message: Message) => {
      if (message.author.bot) return;
      
      // Only respond to Direct Messages
      if (message.guildId) return;

      // Normal questions: delete user message after 5s (requires Manage Messages permission in guilds, but here it's DM)
      // Note: Bots cannot delete user messages in DMs, so scheduleDeletion might fail for the user's message,
      // but it will succeed for the bot's own reply.
      this.scheduleDeletion(message, 5000);

      try {
        const response = await this.groqService.generateResponse(message.content);
        const reply = await message.reply(response);
        this.scheduleDeletion(reply, 5000);
      } catch (error) {
        this.logger.error('Error handling Discord message', error);
      }
    });

    await this.client.login(token);
  }

  private async registerCommands(token: string, clientId: string) {
    const rest = new REST({ version: '10' }).setToken(token);
    
    const commands = [
      {
        name: 'vote',
        description: 'Cast your vote anonymously',
        options: [
          {
            name: 'identificador',
            description: 'Your ID/Code',
            type: 3, // STRING type
            required: true,
          },
          {
            name: 'password',
            description: 'Your password',
            type: 3, // STRING type
            required: true,
          },
          {
            name: 'candidate_id',
            description: 'ID of the candidate',
            type: 3, // STRING type
            required: true,
            autocomplete: true,
          },
        ],
      },
    ];

    try {
      this.logger.log('Started refreshing application (/) commands.');
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      this.logger.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      this.logger.error('Failed to register Discord commands', error);
    }
  }

  private scheduleDeletion(message: Message, delayMs: number) {
    setTimeout(async () => {
      try {
        await message.delete();
      } catch (err: any) {
        // Ignored. Could be due to lacking permissions in DM or Guild.
      }
    }, delayMs);
  }
}
