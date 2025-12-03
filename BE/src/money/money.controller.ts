import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { MoneyService } from './money.service';
import { CreateMoneyDto } from './dto/create-money.dto';
import { UpdateMoneyDto } from './dto/update-money.dto';

@Controller('money')
export class MoneyController {
  constructor(private readonly service: MoneyService) {}

  @Post()
  async create(@Body() dto: CreateMoneyDto) {
    const item = await this.service.create(dto);
    return { success: true, item };
  }

  @Get()
  async findAll() {
    const items = await this.service.findAll();
    return { success: true, items };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.service.findOne(id);
    if (!item) {
      throw new NotFoundException('Item not found');
    }
    return { success: true, item };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMoneyDto) {
    const item = await this.service.update(id, dto);
    return { success: true, item };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const res = await this.service.remove(id);
    return res;
  }
}
