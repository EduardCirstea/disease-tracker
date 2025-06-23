import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) {}

    @Get('summary')
    async getSummary() {
        return this.statisticsService.getSummary();
    }

    @Get('geospatial')
    async getGeospatialStats() {
        return this.statisticsService.getGeospatialStats();
    }

    @Get('diseases')
    async getDiseaseComparison() {
        return this.statisticsService.getDiseaseComparison();
    }

    @Get('timeline')
    async getTimelineStats(
        @Query('interval') interval: 'day' | 'week' | 'month' = 'day',
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const startDateObj = startDate ? new Date(startDate) : undefined;
        const endDateObj = endDate ? new Date(endDate) : undefined;

        return this.statisticsService.getTimelineStats(
            interval,
            startDateObj,
            endDateObj,
        );
    }

    @Get('regional')
    async getRegionalStats() {
        return this.statisticsService.getRegionalStats();
    }
}