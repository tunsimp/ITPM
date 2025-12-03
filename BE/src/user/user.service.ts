import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [];

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((u) => u.email === email);
  }

  async findByStudentId(studentId: string): Promise<User | undefined> {
    return this.users.find((u) => u.studentId === studentId);
  }

  async create(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find((u) => u.id === id);
  }
}
