import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule/dist/scheduler.registry';
import { DiscordService } from 'src/discord/discord.service';
import { REMINDERS } from 'src/remiders.config';
import { CronJob } from 'cron';


@Injectable()
export class ReminderService implements OnModuleInit {
    private readonly logger = new Logger(ReminderService.name);
    constructor(
        private discordService: DiscordService,     // Injected — can now call sendMessage()
        private schedulerRegistry: SchedulerRegistry, // Lets us add cron jobs dynamically
        private configService: ConfigService,
    ) { }

    onModuleInit() {
        const channelId = this.configService.get<string>('DISCORD_CHANNEL_ID');
        

        if (!channelId) {
            throw new Error('DISCORD_CHANNEL_ID is not set in your .env file');
        }

        REMINDERS.forEach((reminder, index) => {
            const jobName = `reminder-${index}`;

            const job = new CronJob(reminder.cronExpression, async () => {
                this.logger.log(`Firing reminder: ${jobName}`);
                await this.discordService.sendMessage(channelId, reminder.message);
            });


            this.schedulerRegistry.addCronJob(jobName, job);
            job.start();

        })

    }

}
