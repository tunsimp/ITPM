import {
    Controller,
    Get,
    Param,
    NotFoundException,
    UseGuards,
    Req,
    ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getProfile(@Param('id') id: string, @Req() req: Request) {
        const payload = (req as any).user;

        if (!payload || payload.sub !== id) {
            throw new ForbiddenException('Access denied for this profile');
        }

        const user = await this.usersService.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const { passwordHash: _, ...userWithoutPassword } = user;

        return {
            success: true,
            user: userWithoutPassword,
        };
    }
}
