import { Module } from '@nestjs/common';
import { PetitionsController } from './petitions.controller';
import { PetitionsService } from './petitions.service';
import { ClassificationModule } from '../classification/classification.module';
import { DonationsModule } from '../donations/donations.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [ClassificationModule, DonationsModule, CommentsModule],
  controllers: [PetitionsController],
  providers: [PetitionsService],
  exports: [PetitionsService],
})
export class PetitionsModule {}
