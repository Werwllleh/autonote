import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [MulterModule.register({ storage: memoryStorage() }), UploadModule],
  controllers: [VehicleController],
  providers: [VehicleService],
})
export class VehicleModule {}
