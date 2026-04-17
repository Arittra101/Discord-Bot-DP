import { Module } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { DiscordModule } from '../discord/discord.module';
import { ConfigModule } from '@nestjs/config/dist/config.module';

@Module({
  imports: [DiscordModule,
    //  ConfigModule.forRoot()
  ], 
  providers: [ReminderService],
})
export class ReminderModule {}
