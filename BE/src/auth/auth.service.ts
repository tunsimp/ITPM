import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    const { email, password, fullName, studentId, emailAlerts } = registerDto;

    // Check if user already exists
    const existingUserByEmail = await this.usersService.findByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictException('Email already registered');
    }

    const existingUserByStudentId =
      await this.usersService.findByStudentId(studentId);
    if (existingUserByStudentId) {
      throw new ConflictException('Student ID already registered');
    }

    try {
      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user object
      const newUser = {
        id: `u_${randomUUID().split('-')[0]}`,
        email,
        passwordHash,
        fullName,
        studentId,
        role: 'student',
        verified: false, // Email verification required
        preferences: {
          emailAlerts: emailAlerts !== undefined ? emailAlerts : true,
        },
        createdAt: new Date().toISOString(),
      };

      // Save user
      const user = await this.usersService.create(newUser);

      // Return user without password
      const { passwordHash: _, ...userWithoutPassword } = user;
      return {
        success: true,
        message: 'User registered successfully. Please verify your email.',
        user: userWithoutPassword,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { passwordHash: _, ...userWithoutPassword } = user;

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      success: true,
      message: 'Login successful',
      accessToken,
      user: userWithoutPassword,
    };
  }
}
