import { Controller, Get, Param, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
    constructor(private readonly locationsService: LocationsService) {}

    @Get()
    async findAll(
        @Query('skip') skip = 0,
        @Query('take') take = 10,
        @Query('search') search?: string,
    ) {
        return this.locationsService.findAll(+skip, +take, search);
    }

    @Get('all')
    async getAllLocations() {
        return this.locationsService.getAllLocations();
    }

    @Get('counties')
    async getCounties() {
        return this.locationsService.getCounties();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.locationsService.findOne(id);
    }
}