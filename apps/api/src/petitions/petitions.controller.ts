import { Controller, Get, Post, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { PetitionsService } from './petitions.service';
import { CreatePetitionDto } from './dto/create-petition.dto';
import { PetitionQueryDto } from './dto/petition-query.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('petitions')
@UseGuards(JwtAuthGuard)
export class PetitionsController {
  constructor(private petitionsService: PetitionsService) {}

  @Public()
  @Get()
  findAll(@Query() query: PetitionQueryDto) {
    return this.petitionsService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.petitionsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePetitionDto, @Request() req: { user: { id: string } }) {
    return this.petitionsService.create(dto, req.user.id);
  }
}
