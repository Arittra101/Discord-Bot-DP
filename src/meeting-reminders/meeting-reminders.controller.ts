import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  MeetingRemindersService,
  ReminderView,
} from './meeting-reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  RequestUser,
} from '../auth/decorators/current-user.decorator';

const VALID_VIEWS: ReminderView[] = ['upcoming', 'past', 'current'];

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class MeetingRemindersController {
  constructor(private service: MeetingRemindersService) {}

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateReminderDto) {
    return this.service.create(user.id, dto);
  }

  @Get()
  findAll(@Query('view') view?: string) {
    if (view && !VALID_VIEWS.includes(view as ReminderView)) {
      throw new BadRequestException(
        `view must be one of: ${VALID_VIEWS.join(', ')}`,
      );
    }
    return this.service.findAll(view as ReminderView | undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReminderDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
