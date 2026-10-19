import { Module } from '@nestjs/common';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { PartModule } from '../part/part.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [PartModule, UploadModule],
  controllers: [ExpenseController],
  providers: [ExpenseService],
  exports: [ExpenseService],
})
export class ExpenseModule {}
