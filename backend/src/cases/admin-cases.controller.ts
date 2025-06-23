import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CaseStatus } from './entities/case.entity';

@Controller('admin/cases')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminCasesController {
    constructor(private readonly casesService: CasesService) {}

    @Post()
    async create(@Body() createCaseDto: CreateCaseDto) {
        return this.casesService.create(createCaseDto);
    }

    @Get()
    async findAll(
        @Query('skip') skip = 0,
        @Query('take') take = 10,
        @Query('disease') disease?: string,
        @Query('status') status?: CaseStatus,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const startDateObj = startDate ? new Date(startDate) : undefined;
        const endDateObj = endDate ? new Date(endDate) : undefined;

        return this.casesService.findAll(
            +skip,
            +take,
            disease,
            status,
            startDateObj,
            endDateObj,
        );
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.casesService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateCaseDto: UpdateCaseDto) {
        return this.casesService.update(id, updateCaseDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.casesService.remove(id);
    }
}