import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserService } from './user.service';
import {
  UpdateEmailDto,
  UpdatePasswordDto,
  UpdateNotificationSettingsDto,
} from './dto/update-profile.dto';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  getProfile(@CurrentUser('id') userId: string) {
    return this.userService.getProfile(userId);
  }

  @Put('email')
  updateEmail(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateEmailDto,
  ) {
    return this.userService.updateEmail(userId, dto);
  }

  @Put('password')
  updatePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(userId, dto);
  }

  @Put('notification-settings')
  updateNotificationSettings(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    return this.userService.updateNotificationSettings(userId, dto);
  }

  @Put('avatar')
  @UseInterceptors(FileInterceptor('file', { storage: undefined }))
  uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.userService.updateAvatar(userId, file);
  }

  @Delete('avatar')
  removeAvatar(@CurrentUser('id') userId: string) {
    return this.userService.removeAvatar(userId);
  }

  @Delete('account')
  deleteAccount(
    @CurrentUser('id') userId: string,
    @Body('password') password: string,
  ) {
    return this.userService.deleteAccount(userId, password);
  }
}
