import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Money, MoneyType } from './entities/money.entity';
import { CreateMoneyDto } from './dto/create-money.dto';
import { UpdateMoneyDto } from './dto/update-money.dto';

@Injectable()
export class MoneyService {
  constructor(private prisma: PrismaService) { }

  async create(createDto: CreateMoneyDto): Promise<Money> {
    // Convert entity enum (lowercase) to Prisma enum (uppercase)
    const prismaType = createDto.type.toUpperCase() as 'EXPENSE' | 'INCOME';

    const money = await this.prisma.money.create({
      data: {
        name: createDto.name,
        amount: createDto.amount,
        type: prismaType,
        description: createDto.description,
      },
    });
    return this.mapToEntity(money);
  }

  async findAll(): Promise<Money[]> {
    const items = await this.prisma.money.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return items.map((item) => this.mapToEntity(item));
  }

  async findOne(id: string): Promise<Money> {
    const money = await this.prisma.money.findUnique({
      where: { id },
    });
    if (!money) {
      throw new NotFoundException(`Money item with id ${id} not found`);
    }
    return this.mapToEntity(money);
  }

  async update(id: string, updateDto: UpdateMoneyDto): Promise<Money> {
    const existing = await this.prisma.money.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Money item with id ${id} not found`);
    }

    const updateData: any = {};
    if (updateDto.name !== undefined) updateData.name = updateDto.name;
    if (updateDto.amount !== undefined) updateData.amount = updateDto.amount;
    if (updateDto.type !== undefined) {
      updateData.type = updateDto.type.toUpperCase() as 'EXPENSE' | 'INCOME';
    }
    if (updateDto.description !== undefined) updateData.description = updateDto.description;

    const money = await this.prisma.money.update({
      where: { id },
      data: updateData,
    });
    return this.mapToEntity(money);
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const existing = await this.prisma.money.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Money item with id ${id} not found`);
    }

    await this.prisma.money.delete({
      where: { id },
    });
    return { success: true };
  }

  private mapToEntity(prismaMoney: any): Money {
    // Convert Prisma enum (uppercase) to entity enum (lowercase)
    const entityType = prismaMoney.type.toLowerCase() as MoneyType;

    return {
      id: prismaMoney.id,
      name: prismaMoney.name,
      amount: prismaMoney.amount,
      type: entityType,
      description: prismaMoney.description || undefined,
      createdAt: prismaMoney.createdAt,
      updatedAt: prismaMoney.updatedAt || undefined,
    };
  }
}
