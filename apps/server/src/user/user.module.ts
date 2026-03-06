import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    MulterModule.register({ storage: memoryStorage() }),
    UploadModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
