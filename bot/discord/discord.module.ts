import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { GroqModule } from '../groq/groq.module';
import { VotingModule } from '../voting/voting.module';

@Module({
  imports: [GroqModule, VotingModule],
  providers: [DiscordService],
})
export class DiscordModule {}
