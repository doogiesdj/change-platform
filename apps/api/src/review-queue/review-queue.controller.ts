import { Controller, Get, Patch, Delete, Param, Body, Request, Query } from '@nestjs/common';
import { ReviewQueueService } from './review-queue.service';
import { DecideReviewDto } from './dto/decide-review.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin/review-queue')
@Roles('moderator', 'admin')
export class ReviewQueueController {
  constructor(private reviewQueueService: ReviewQueueService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.reviewQueueService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewQueueService.findOne(id);
  }

  @Patch(':id/assign')
  assign(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.reviewQueueService.assign(id, req.user.id);
  }

  @Delete(':id')
  @Roles('admin')
  delete(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.reviewQueueService.deleteFromQueue(id, req.user.id);
  }

  @Patch(':id/decide')
  decide(
    @Param('id') id: string,
    @Body() dto: DecideReviewDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.reviewQueueService.decide(
      id,
      dto.decision,
      req.user.id,
      dto.note,
      dto.newCategoryCode,
    );
  }
}
