import { Module } from '@nestjs/common';
import { PetitionsController } from './petitions.controller';
import { PetitionsService } from './petitions.service';
import { ClassificationModule } from '../classification/classification.module';
import { DonationsModule } from '../donations/donations.module';

@Module({
  imports: [ClassificationModule, DonationsModule],
  controllers: [PetitionsController],
  providers: [PetitionsService],
  exports: [PetitionsService],
})
export class PetitionsModule {}
