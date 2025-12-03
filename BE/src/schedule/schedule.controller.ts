import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Controller('schedule')
export class ScheduleController {
    constructor(private readonly scheduleService: ScheduleService) { }

    @Post()
    async createSchedule(@Body() dto: CreateScheduleDto) {
        const schedule = await this.scheduleService.create(dto);
        return schedule;
    }

    @Get()
    async getAllSchedules() {
        const schedules = await this.scheduleService.findAll();
        return schedules;
    }

    @Get(':id')
    async getScheduleById(@Param('id') id: string) {
        const schedule = await this.scheduleService.findOne(id);
        return schedule;
    }

    @Put(':id')
    async updateSchedule(@Param('id') id: string, @Body() dto: UpdateScheduleDto) {
        const schedule = await this.scheduleService.update(id, dto);
        return schedule;
    }

    @Delete(':id')
    async deleteSchedule(@Param('id') id: string) {
        const result = await this.scheduleService.remove(id);
        return result;
    }
}

