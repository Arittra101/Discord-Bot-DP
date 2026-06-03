import { Module } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { DiscordModule } from '../discord/discord.module';

@Module({
  imports: [
    DiscordModule,
    //  ConfigModule.forRoot()
  ],
  providers: [ReminderService],
})
export class ReminderModule {}
