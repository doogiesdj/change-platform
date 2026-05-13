import { Controller, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  delete(@Param('id') id: string, @Req() req: any) {
    return this.commentsService.delete(id, req.user.sub, req.user.role);
  }
}
