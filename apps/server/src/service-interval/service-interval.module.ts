import { Module } from '@nestjs/common';
import { ServiceIntervalController } from './service-interval.controller';
import { ServiceIntervalService } from './service-interval.service';

@Module({
  controllers: [ServiceIntervalController],
  providers: [ServiceIntervalService],
  exports: [ServiceIntervalService],
})
export class ServiceIntervalModule {}
