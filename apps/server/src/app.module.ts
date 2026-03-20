import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { CategoryModule } from './category/category.module';
import { ExpenseModule } from './expense/expense.module';
import { StatsModule } from './stats/stats.module';
import { UploadModule } from './upload/upload.module';
import { PartModule } from './part/part.module';
import { ServiceIntervalModule } from './service-interval/service-interval.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/api/uploads',
      serveStaticOptions: { index: false },
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    VehicleModule,
    CategoryModule,
    ExpenseModule,
    StatsModule,
    UploadModule,
    PartModule,
    ServiceIntervalModule,
  ],
})
export class AppModule {}
