import { Controller, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ReviewQueueService } from './review-queue.service';
import { DecideReviewDto } from './dto/decide-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('review-queue')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('moderator', 'admin')
export class ReviewQueueController {
  constructor(private reviewQueueService: ReviewQueueService) {}

  @Get()
  findPending() {
    return this.reviewQueueService.findPending();
  }

  @Patch(':id/assign')
  assign(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.reviewQueueService.assign(id, req.user.id);
  }

  @Patch(':id/decide')
  decide(
    @Param('id') id: string,
    @Body() dto: DecideReviewDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.reviewQueueService.decide(id, dto.decision, req.user.id, dto.note);
  }
}
