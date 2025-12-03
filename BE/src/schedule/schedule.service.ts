import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Schedule } from './entities/schedule.entity';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
        const schedule = await this.prisma.schedule.create({
            data: {
                course: createScheduleDto.course,
                code: createScheduleDto.code,
                professor: createScheduleDto.professor,
                room: createScheduleDto.room,
                time: createScheduleDto.time,
                day: createScheduleDto.day,
                isRecurring: createScheduleDto.isRecurring || false,
            },
        });
        return this.mapToEntity(schedule);
    }

    async findAll(): Promise<Schedule[]> {
        const schedules = await this.prisma.schedule.findMany({
            orderBy: [
                { day: 'asc' },
                { time: 'asc' },
            ],
        });
        return schedules.map((schedule) => this.mapToEntity(schedule));
    }

    async findOne(id: string): Promise<Schedule> {
        const schedule = await this.prisma.schedule.findUnique({
            where: { id },
        });
        if (!schedule) {
            throw new NotFoundException(`Schedule with id ${id} not found`);
        }
        return this.mapToEntity(schedule);
    }

    async update(id: string, dto: UpdateScheduleDto): Promise<Schedule> {
        const existing = await this.prisma.schedule.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new NotFoundException(`Schedule with id ${id} not found`);
        }

        const updateData: any = {};
        if (dto.course !== undefined) updateData.course = dto.course;
        if (dto.code !== undefined) updateData.code = dto.code;
        if (dto.professor !== undefined) updateData.professor = dto.professor;
        if (dto.room !== undefined) updateData.room = dto.room;
        if (dto.time !== undefined) updateData.time = dto.time;
        if (dto.day !== undefined) updateData.day = dto.day;
        if (dto.isRecurring !== undefined) updateData.isRecurring = dto.isRecurring;

        const schedule = await this.prisma.schedule.update({
            where: { id },
            data: updateData,
        });
        return this.mapToEntity(schedule);
    }

    async remove(id: string): Promise<{ success: boolean }> {
        const existing = await this.prisma.schedule.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new NotFoundException(`Schedule with id ${id} not found`);
        }

        await this.prisma.schedule.delete({
            where: { id },
        });
        return { success: true };
    }

    private mapToEntity(prismaSchedule: any): Schedule {
        return {
            id: prismaSchedule.id,
            course: prismaSchedule.course,
            code: prismaSchedule.code || undefined,
            professor: prismaSchedule.professor || undefined,
            room: prismaSchedule.room || undefined,
            time: prismaSchedule.time,
            day: prismaSchedule.day,
            isRecurring: prismaSchedule.isRecurring || false,
            createdAt: prismaSchedule.createdAt,
            updatedAt: prismaSchedule.updatedAt || undefined,
        };
    }
}

