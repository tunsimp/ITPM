import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createTaskDto: CreateTaskDto): Promise<Task> {
        // Convert to uppercase for Prisma enum
        const status = createTaskDto.status
            ? (createTaskDto.status.toUpperCase() as 'PENDING' | 'COMPLETED')
            : 'PENDING';
        const priority = createTaskDto.priority
            ? (createTaskDto.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH')
            : 'MEDIUM';

        const task = await this.prisma.task.create({
            data: {
                title: createTaskDto.title,
                course: createTaskDto.course,
                dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
                status: status,
                priority: priority,
                reminder: createTaskDto.reminder || false,
            },
        });
        return this.mapToEntity(task);
    }

    async getAllTasks(): Promise<Task[]> {
        const tasks = await this.prisma.task.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return tasks.map((task) => this.mapToEntity(task));
    }

    async getTaskById(id: string): Promise<Task> {
        const task = await this.prisma.task.findUnique({
            where: { id },
        });
        if (!task) {
            throw new NotFoundException(`Task with id ${id} not found`);
        }
        return this.mapToEntity(task);
    }

    async updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
        const existing = await this.prisma.task.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new NotFoundException(`Task with id ${id} not found`);
        }

        const updateData: any = {};
        if (dto.title !== undefined) updateData.title = dto.title;
        if (dto.course !== undefined) updateData.course = dto.course;
        if (dto.dueDate !== undefined) updateData.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
        if (dto.status !== undefined) {
            updateData.status = dto.status.toUpperCase() as 'PENDING' | 'COMPLETED';
        }
        if (dto.priority !== undefined) {
            updateData.priority = dto.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH';
        }
        if (dto.reminder !== undefined) updateData.reminder = dto.reminder;

        const task = await this.prisma.task.update({
            where: { id },
            data: updateData,
        });
        return this.mapToEntity(task);
    }

    async deleteTask(id: string): Promise<{ success: boolean }> {
        const existing = await this.prisma.task.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new NotFoundException(`Task with id ${id} not found`);
        }

        await this.prisma.task.delete({
            where: { id },
        });
        return { success: true };
    }

    private mapToEntity(prismaTask: any): Task {
        return {
            id: prismaTask.id,
            title: prismaTask.title,
            course: prismaTask.course || undefined,
            dueDate: prismaTask.dueDate || undefined,
            status: prismaTask.status as 'PENDING' | 'COMPLETED',
            priority: prismaTask.priority as 'LOW' | 'MEDIUM' | 'HIGH',
            reminder: prismaTask.reminder,
            createdAt: prismaTask.createdAt,
            updatedAt: prismaTask.updatedAt || undefined,
        };
    }
}
