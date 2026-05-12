import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.petitionCategory.findMany({
      where: { parentCode: null },
      include: {
        children: {
          include: { children: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findOne(code: string) {
    return this.prisma.petitionCategory.findUnique({
      where: { code },
      include: {
        children: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }
}
