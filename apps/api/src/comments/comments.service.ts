import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async list(petitionId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { petitionId, deletedAt: null, parentId: null },
      include: {
        author: { select: { id: true, displayName: true, avatarUrl: true } },
        replies: {
          where: { deletedAt: null },
          include: {
            author: { select: { id: true, displayName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return comments;
  }

  async create(petitionId: string, authorId: string, dto: CreateCommentDto) {
    if (dto.parentId) {
      const parent = await this.prisma.comment.findFirst({
        where: { id: dto.parentId, petitionId, deletedAt: null },
      });
      if (!parent) throw new NotFoundException('부모 댓글을 찾을 수 없습니다.');
    }

    return this.prisma.comment.create({
      data: {
        petitionId,
        authorId,
        content: dto.content,
        parentId: dto.parentId ?? null,
      },
      include: {
        author: { select: { id: true, displayName: true, avatarUrl: true } },
        replies: true,
      },
    });
  }

  async delete(commentId: string, userId: string, userRole: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
    });
    if (!comment) throw new NotFoundException('댓글을 찾을 수 없습니다.');

    const isOwner = comment.authorId === userId;
    const isAdmin = ['admin', 'moderator'].includes(userRole);
    if (!isOwner && !isAdmin) throw new ForbiddenException('삭제 권한이 없습니다.');

    await this.prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    return { message: '댓글이 삭제되었습니다.' };
  }
}
