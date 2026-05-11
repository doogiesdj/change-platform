import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('donations')
@UseGuards(JwtAuthGuard)
export class DonationsController {
  constructor(private donationsService: DonationsService) {}

  @Post()
  create(
    @Body() dto: CreateDonationDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.donationsService.create(dto, req.user.id);
  }

  @Get('my')
  findMyDonations(@Request() req: { user: { id: string } }) {
    return this.donationsService.findByUser(req.user.id);
  }
}
