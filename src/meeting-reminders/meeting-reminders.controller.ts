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
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiQuery,
} from '@nestjs/swagger';
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

@ApiTags('reminders')
@ApiBearerAuth()
@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class MeetingRemindersController {
  constructor(private service: MeetingRemindersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a meeting reminder' })
  @ApiCreatedResponse({ description: 'Reminder created and queued in BullMQ' })
  @ApiBadRequestResponse({ description: 'remindAt is in the past' })
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateReminderDto) {
    return this.service.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List reminders, optionally filtered by view' })
  @ApiQuery({
    name: 'view',
    required: false,
    enum: ['upcoming', 'past', 'current'],
  })
  @ApiOkResponse({ description: 'Array of reminders' })
  @ApiBadRequestResponse({ description: 'Invalid view parameter' })
  findAll(@Query('view') view?: string) {
    if (view && !VALID_VIEWS.includes(view as ReminderView)) {
      throw new BadRequestException(
        `view must be one of: ${VALID_VIEWS.join(', ')}`,
      );
    }
    return this.service.findAll(view as ReminderView | undefined);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single reminder by ID' })
  @ApiOkResponse({ description: 'Reminder found' })
  @ApiNotFoundResponse({ description: 'Reminder not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a reminder (only if not yet sent)' })
  @ApiOkResponse({ description: 'Reminder updated' })
  @ApiNotFoundResponse({ description: 'Reminder not found' })
  @ApiBadRequestResponse({
    description: 'Reminder already sent or past scheduled time',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReminderDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a reminder (only if not yet sent)' })
  @ApiNoContentResponse({ description: 'Reminder deleted' })
  @ApiNotFoundResponse({ description: 'Reminder not found' })
  @ApiBadRequestResponse({
    description: 'Reminder already sent or past scheduled time',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
