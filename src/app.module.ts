import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiscordModule } from './discord/discord.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ReminderModule } from './reminder/reminder.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { MeetingReminder } from './meeting-reminders/entities/meeting-reminder.entity';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MeetingRemindersModule } from './meeting-reminders/meeting-reminders.module';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'src/.env',
    }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = new URL(config.getOrThrow<string>('REDIS_URL'));
        return {
          connection: {
            host: url.hostname,
            port: Number(url.port) || 6379,
            username: url.username || undefined,
            password: decodeURIComponent(url.password) || undefined,
            tls: url.protocol === 'rediss:' ? {} : undefined,
            maxRetriesPerRequest: null,
          },
        };
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const ext = __filename.endsWith('.ts') ? '.ts' : '.js';
        return {
          type: 'postgres',
          url: config.get<string>('DATABASE_URL'),
          ssl: { rejectUnauthorized: false },
          entities: [User, MeetingReminder],
          migrations: [join(__dirname, `migrations/*${ext}`)],
          migrationsRun: false,
          synchronize: false,
          logging: ['error', 'warn'],
        };
      },
    }),
    DiscordModule,
    ReminderModule,
    AuthModule,
    UsersModule,
    MeetingRemindersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
