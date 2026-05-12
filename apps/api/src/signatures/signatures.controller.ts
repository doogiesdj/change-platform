import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { SignaturesService } from './signatures.service';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Controller('petitions/:petitionId/signatures')
export class SignaturesController {
  constructor(private signaturesService: SignaturesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('petitionId') petitionId: string,
    @Body() dto: CreateSignatureDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.signaturesService.create(petitionId, dto, user.id);
  }

  @Get('stats')
  @Public()
  async getStats(@Param('petitionId') petitionId: string) {
    return this.signaturesService.getStats(petitionId);
  }
}
