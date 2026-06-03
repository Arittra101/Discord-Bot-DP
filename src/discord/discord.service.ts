import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client, GatewayIntentBits, TextChannel } from 'discord.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordService implements OnModuleInit {
  private readonly logger = new Logger(DiscordService.name);
  private client: Client;

  constructor(private configService: ConfigService) {
    this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
  }

  async onModuleInit() {
    const token = this.configService.get<string>('DISCORD_BOT_TOKEN');
    if (!token) {
      throw new Error(
        'Missing DISCORD_BOT_TOKEN. Ensure it is set in environment variables or in src/.env.',
      );
    }
    await this.client.login(token);

    this.client.once('ready', () => {
      this.logger.log(`Logged in as ${this.client.user?.tag}!`);
    });
  }

  async sendMessage(channelId: string, message: string): Promise<void> {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel || !(channel instanceof TextChannel)) {
        this.logger.error(
          `Channel ${channelId} not found or is not a text channel`,
        );
        return;
      }

      //  await channel.send(message,);
      await channel.send({
        content: message,
        allowedMentions: {
          parse: ['everyone'],
        },
      });

      this.logger.log(`Reminder sent to channel ${channelId}`);
    } catch (error) {
      this.logger.error('Failed to send message', error);
    }
  }
}

// exicution order:
// 1. Property initialization (logger)
// 2. constructor()
// 3. onModuleInit()
// readonly list: ReadonlyArray<string> = ["kdf", "fdf"] like val list = listOf("kdf","fdf")
