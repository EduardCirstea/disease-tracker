import { Controller, Get, Query, Param } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CaseStatus } from './entities/case.entity';

@Controller('cases')
export class CasesController {
    constructor(private readonly casesService: CasesService) {}

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

    @Get('recent')
    async findRecent(@Query('limit') limit = 10) {
        return this.casesService.findRecent(+limit);
    }

    @Get('statistics/by-disease')
    async getCasesByDisease() {
        return this.casesService.getCasesByDisease();
    }

    @Get('statistics/by-status')
    async getCasesByStatus() {
        return this.casesService.getCasesByStatus();
    }

    @Get('statistics/by-location')
    async getCasesByLocation() {
        return this.casesService.getCasesByLocation();
    }

    @Get('statistics/by-time')
    async getCasesByTime(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('interval') interval: 'day' | 'week' | 'month' = 'day',
    ) {
        const startDateObj = new Date(startDate || new Date().setMonth(new Date().getMonth() - 1));
        const endDateObj = new Date(endDate || new Date());

        return this.casesService.getCasesByTime(
            startDateObj,
            endDateObj,
            interval,
        );
    }

    @Get('geospatial')
    async getGeospatialData() {
        return this.casesService.getGeospatialData();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.casesService.findOne(id);
    }
}