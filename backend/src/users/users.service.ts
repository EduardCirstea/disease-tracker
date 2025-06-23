import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async findAll(): Promise<User[]> {
        return this.usersRepository.find({
            select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'updatedAt'],
        });
    }

    async findOne(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID "${id}" not found`);
        }
        return user;
    }

    async findOneByEmail(email: string): Promise<User> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.findOneByEmail(createUserDto.email);
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const user = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });

        return this.usersRepository.save(user);
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);

        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.findOneByEmail(updateUserDto.email);
            if (existingUser) {
                throw new ConflictException('Email already exists');
            }
        }

        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        await this.usersRepository.update(id, updateUserDto);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        const user = await this.findOne(id);
        await this.usersRepository.remove(user);
    }

    async createAdminUser(email: string, password: string): Promise<User> {
        const existingAdmin = await this.usersRepository.findOne({
            where: { role: UserRole.ADMIN },
        });

        if (existingAdmin) {
            return existingAdmin;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const adminUser = this.usersRepository.create({
            email,
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: UserRole.ADMIN,
        });

        return this.usersRepository.save(adminUser);
    }
}