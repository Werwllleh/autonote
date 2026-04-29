import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  /** Return system categories + current user's custom categories */
  findAll(userId: string) {
    return this.prisma.category.findMany({
      where: {
        OR: [{ isSystem: true }, { userId }],
      },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  /** Create a user-scoped custom category */
  create(dto: CreateCategoryDto, userId: string) {
    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.name
          .toLowerCase()
          .replace(/[^a-zа-яё0-9]+/gi, '-')
          .replace(/(^-|-$)/g, ''),
        isSystem: false,
        userId,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryDto, userId: string) {
    const category = await this.findOne(id);
    if (category.isSystem) {
      throw new ForbiddenException('Cannot edit system category');
    }
    if (category.userId !== userId) {
      throw new ForbiddenException('Cannot edit another user\'s category');
    }
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    const category = await this.findOne(id);
    if (category.isSystem) {
      throw new ForbiddenException('Cannot delete system category');
    }
    if (category.userId !== userId) {
      throw new ForbiddenException('Cannot delete another user\'s category');
    }
    return this.prisma.category.delete({ where: { id } });
  }
}
