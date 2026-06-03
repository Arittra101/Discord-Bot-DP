import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';

@Module({
  // imports: [
  //        ConfigModule.forRoot()
  // ],
  providers: [DiscordService], //register service on module
  exports: [DiscordService], //export service to be used in other modules
})
export class DiscordModule {}
