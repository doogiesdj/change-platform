import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { PetitionsService } from './petitions.service';
import { DonationsService } from '../donations/donations.service';
import { CommentsService } from '../comments/comments.service';
import { CreatePetitionDto } from './dto/create-petition.dto';
import { UpdatePetitionDto } from './dto/update-petition.dto';
import { PetitionQueryDto } from './dto/petition-query.dto';
import { CreatePetitionUpdateDto } from './dto/create-petition-update.dto';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('petitions')
export class PetitionsController {
  constructor(
    private petitionsService: PetitionsService,
    private donationsService: DonationsService,
    private commentsService: CommentsService,
  ) {}

  @Public()
  @Get()
  findAll(@Query() query: PetitionQueryDto) {
    return this.petitionsService.findAll(query);
  }

  @Get('me')
  findMine(@CurrentUser() user: CurrentUserPayload) {
    return this.petitionsService.findMine(user.id);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.petitionsService.findOne(id);
  }

  @Public()
  @Get(':id/donations/stats')
  getDonationStats(@Param('id') id: string) {
    return this.donationsService.getDonationStats(id);
  }

  @Post()
  create(@Body() dto: CreatePetitionDto, @CurrentUser() user: CurrentUserPayload) {
    return this.petitionsService.create(dto, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePetitionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.petitionsService.update(id, dto, user.id);
  }

  @Public()
  @Get(':id/updates')
  getUpdates(@Param('id') id: string) {
    return this.petitionsService.getUpdates(id);
  }

  @Post(':id/updates')
  createUpdate(
    @Param('id') id: string,
    @Body() dto: CreatePetitionUpdateDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.petitionsService.createUpdate(id, dto, user.id);
  }

  @Delete(':id')
  @Roles('admin', 'moderator')
  deletePetition(@Param('id') id: string) {
    return this.petitionsService.deletePetition(id);
  }

  @Public()
  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.commentsService.list(id);
  }

  @Post(':id/comments')
  createComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.commentsService.create(id, user.id, dto);
  }
}
