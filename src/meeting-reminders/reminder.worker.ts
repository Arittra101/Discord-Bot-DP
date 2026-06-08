import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { MeetingReminder } from './entities/meeting-reminder.entity';
import { DiscordService } from '../discord/discord.service';
import { REMINDER_QUEUE } from './reminder.producer';

interface ReminderJobData {
  reminderId: string;
}

@Processor(REMINDER_QUEUE)
export class ReminderWorker extends WorkerHost {
  private readonly logger = new Logger(ReminderWorker.name);

  constructor(
    @InjectRepository(MeetingReminder)
    private reminderRepo: Repository<MeetingReminder>,
    private discordService: DiscordService,
    private configService: ConfigService,
  ) {
    super();
  }

  async process(job: Job<ReminderJobData>): Promise<void> {
    const { reminderId } = job.data;

    // eager: true on createdBy means the user is loaded automatically
    const reminder = await this.reminderRepo.findOne({
      where: { id: reminderId },
    });

    if (!reminder) {
      this.logger.warn(`Reminder ${reminderId} not found — skipping`);
      return;
    }

    if (reminder.isSent) {
      this.logger.warn(`Reminder ${reminderId} already sent — skipping`);
      return;
    }

    const channelId =
      this.configService.getOrThrow<string>('DISCORD_CHANNEL_ID');
    const message =
      `@everyone ⏰ **Meeting Reminder**\n` +
      `📌 ${reminder.title}\n\n` +
      `${reminder.content}\n\n` +
      `— set by <@${reminder.createdBy.discordId}>`;

    await this.discordService.sendMessage(channelId, message);
    await this.reminderRepo.update(reminderId, { isSent: true });

    this.logger.log(`Reminder ${reminderId} ("${reminder.title}") fired`);
  }
}
