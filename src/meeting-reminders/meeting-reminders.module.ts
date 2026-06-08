import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { MeetingReminder } from './entities/meeting-reminder.entity';
import { MeetingRemindersService } from './meeting-reminders.service';
import { MeetingRemindersController } from './meeting-reminders.controller';
import { ReminderProducer, REMINDER_QUEUE } from './reminder.producer';
import { ReminderWorker } from './reminder.worker';
import { AuthModule } from '../auth/auth.module';
import { DiscordModule } from '../discord/discord.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MeetingReminder]),
    BullModule.registerQueue({ name: REMINDER_QUEUE }),
    AuthModule,
    DiscordModule,
  ],
  controllers: [MeetingRemindersController],
  providers: [MeetingRemindersService, ReminderProducer, ReminderWorker],
})
export class MeetingRemindersModule {}
