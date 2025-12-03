import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    async createTask(@Body() dto: CreateTaskDto) {
        const task = await this.tasksService.create(dto);
        return task;
    }

    @Get()
    async getAllTasks() {
        const tasks = await this.tasksService.getAllTasks();
        return tasks;
    }

    @Get(':id')
    async getTaskById(@Param('id') id: string) {
        const task = await this.tasksService.getTaskById(id);
        return task;
    }

    @Put(':id')
    async updateTask(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
        const task = await this.tasksService.updateTask(id, dto);
        return task;
    }

    @Delete(':id')
    async deleteTask(@Param('id') id: string) {
        const result = await this.tasksService.deleteTask(id);
        return result;
    }
}
