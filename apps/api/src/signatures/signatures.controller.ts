import { Controller, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SignaturesService } from './signatures.service';
import { CreateSignatureDto } from './dto/create-signature.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('petitions/:petitionId/signatures')
@UseGuards(JwtAuthGuard)
export class SignaturesController {
  constructor(private signaturesService: SignaturesService) {}

  @Post()
  create(
    @Param('petitionId') petitionId: string,
    @Body() dto: CreateSignatureDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.signaturesService.create(petitionId, dto, req.user.id);
  }
}
