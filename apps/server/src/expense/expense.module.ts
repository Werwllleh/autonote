import { Module } from '@nestjs/common';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { PartModule } from '../part/part.module';

@Module({
  imports: [PartModule],
  controllers: [ExpenseController],
  providers: [ExpenseService],
})
export class ExpenseModule {}
