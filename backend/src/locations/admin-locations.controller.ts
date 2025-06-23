import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('admin/locations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminLocationsController {
    constructor(private readonly locationsService: LocationsService) {}

    @Post()
    async create(@Body() createLocationDto: CreateLocationDto) {
        return this.locationsService.create(createLocationDto);
    }

    @Get()
    async findAll(
        @Query('skip') skip = 0,
        @Query('take') take = 10,
        @Query('search') search?: string,
    ) {
        return this.locationsService.findAll(+skip, +take, search);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.locationsService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
        return this.locationsService.update(id, updateLocationDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.locationsService.remove(id);
    }
}