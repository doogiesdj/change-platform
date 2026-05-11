import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PetitionsModule } from './petitions/petitions.module';
import { SignaturesModule } from './signatures/signatures.module';
import { DonationsModule } from './donations/donations.module';
import { CategoriesModule } from './categories/categories.module';
import { ReviewQueueModule } from './review-queue/review-queue.module';
import { ClassificationModule } from './classification/classification.module';
import { AdminModule } from './admin/admin.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    PetitionsModule,
    SignaturesModule,
    DonationsModule,
    CategoriesModule,
    ReviewQueueModule,
    ClassificationModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
