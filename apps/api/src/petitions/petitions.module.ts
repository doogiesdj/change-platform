import { Module } from '@nestjs/common';
import { PetitionsController } from './petitions.controller';
import { PetitionsService } from './petitions.service';
import { ClassificationModule } from '../classification/classification.module';

@Module({
  imports: [ClassificationModule],
  controllers: [PetitionsController],
  providers: [PetitionsService],
  exports: [PetitionsService],
})
export class PetitionsModule {}
