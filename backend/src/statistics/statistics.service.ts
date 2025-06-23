import { Injectable } from '@nestjs/common';
import { CasesService } from '../cases/cases.service';
import { LocationsService } from '../locations/locations.service';

@Injectable()
export class StatisticsService {
    constructor(
        private casesService: CasesService,
        private locationsService: LocationsService,
    ) {}

    async getSummary() {
        try {
            const [cases] = await this.casesService.findAll(0, 1);
            const [allCases, totalCases] = await this.casesService.findAll(0, 0);
            const casesByDisease = await this.casesService.getCasesByDisease() || [];
            const casesByStatus = await this.casesService.getCasesByStatus() || [];
            const casesByLocation = await this.casesService.getCasesByLocation() || [];

            // Calculăm perioada de timp pentru cazurile recente (ultimele 30 de zile)
            const now = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);

            const recentCases = await this.casesService.getCasesByTime(
                thirtyDaysAgo,
                now,
                'day',
            ) || [];

            return {
                totalCases: totalCases || 0,
                casesByDisease: (casesByDisease || []).slice(0, 5), // Top 5 boli
                casesByStatus: casesByStatus || [],
                topLocations: (casesByLocation || []).slice(0, 5), // Top 5 locații
                recentCases: recentCases || [],
            };
        } catch (error) {
            console.error('Error in getSummary:', error);
            return {
                totalCases: 0,
                casesByDisease: [],
                casesByStatus: [],
                topLocations: [],
                recentCases: [],
            };
        }
    }

    async getGeospatialStats() {
        const locations = await this.locationsService.getAllLocations();
        const casesPerLocation = await this.casesService.getCasesByLocation();

        // Îmbinăm datele de locație cu numărul de cazuri
        const geospatialData = locations.map(location => {
            const caseData = casesPerLocation.find(item => item.locationId === location.id);
            return {
                id: location.id,
                name: location.name,
                city: location.city,
                county: location.county,
                latitude: location.latitude,
                longitude: location.longitude,
                count: caseData ? parseInt(caseData.count, 10) : 0,
            };
        });

        return geospatialData;
    }

    async getDiseaseComparison() {
        const casesByDisease = await this.casesService.getCasesByDisease();
        return casesByDisease;
    }

    async getTimelineStats(
        interval: 'day' | 'week' | 'month' = 'day',
        startDate?: Date,
        endDate?: Date,
    ) {
        try {
            const start = startDate || new Date(new Date().setMonth(new Date().getMonth() - 1));
            const end = endDate || new Date();

            const results = await this.casesService.getCasesByTime(start, end, interval);
            return results || [];
        } catch (error) {
            console.error('Error in getTimelineStats:', error);
            return [];
        }
    }

    async getRegionalStats() {
        const counties = await this.locationsService.getCounties();
        const casesByLocation = await this.casesService.getCasesByLocation();

        const locationMap = new Map();

        // Grupăm locațiile după județ
        for (const caseData of casesByLocation) {
            const location = await this.locationsService.findOne(caseData.locationId);

            if (!locationMap.has(location.county)) {
                locationMap.set(location.county, 0);
            }

            locationMap.set(
                location.county,
                locationMap.get(location.county) + parseInt(caseData.count, 10)
            );
        }

        // Convertim Map la array pentru răspuns
        const regionalStats = Array.from(locationMap.entries()).map(([county, count]) => ({
            county,
            count,
        }));

        return regionalStats.sort((a, b) => b.count - a.count);
    }
}
