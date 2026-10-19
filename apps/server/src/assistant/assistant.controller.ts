import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AssistantService } from './assistant.service';
import { SendMessageDto } from './dto/send-message.dto';

@UseGuards(JwtAuthGuard)
@Controller('vehicles/:vehicleId/assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Get('messages')
  getMessages(
    @CurrentUser('id') userId: string,
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
  ) {
    return this.assistantService.getMessages(userId, vehicleId);
  }

  @Post('chat')
  chat(
    @CurrentUser('id') userId: string,
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.assistantService.chat(userId, vehicleId, dto.message);
  }

  @Delete('messages')
  clearMessages(
    @CurrentUser('id') userId: string,
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
  ) {
    return this.assistantService.clearMessages(userId, vehicleId);
  }
}
