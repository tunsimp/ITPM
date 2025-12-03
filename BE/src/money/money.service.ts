import { Injectable, NotFoundException } from '@nestjs/common';
import { Money } from './entities/money.entity';
import { CreateMoneyDto } from './dto/create-money.dto';
import { UpdateMoneyDto } from './dto/update-money.dto';



@Injectable()
export class MoneyService {
  private items: Money[] = [];

  async create(createDto: CreateMoneyDto): Promise<Money> {
    const now = new Date();
    const newItem: Money = {
      id: `m${Date.now()}`,
      name: createDto.name,
      amount: createDto.amount,
      description: createDto.description,
      createdAt: now,
    };
    this.items.push(newItem);
    return newItem;
  }

  async findAll(): Promise<Money[]> {
    return this.items;
  }

  async findOne(id: string): Promise<Money> {
    const found = this.items.find((i) => i.id === id);
    if (!found) {
      throw new NotFoundException(`Money item with id ${id} not found`);
    }
    return found;
  }

  async update(id: string, updateDto: UpdateMoneyDto): Promise<Money> {
    const idx = this.items.findIndex((i) => i.id === id);
    if (idx === -1) {
      throw new NotFoundException(`Money item with id ${id} not found`);
    }

    const existing = this.items[idx];
    const updated: Money = {
      ...existing,
      ...updateDto,
      updatedAt: new Date(),
    } as Money;

    this.items[idx] = updated;
    return updated;
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const idx = this.items.findIndex((i) => i.id === id);
    if (idx === -1) {
      throw new NotFoundException(`Money item with id ${id} not found`);
    }
    this.items.splice(idx, 1);
    return { success: true };
  }
}
