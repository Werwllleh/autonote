import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { StatsModule } from '../stats/stats.module';
import { ExpenseModule } from '../expense/expense.module';
import { PartModule } from '../part/part.module';

@Module({
  imports: [StatsModule, ExpenseModule, PartModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
