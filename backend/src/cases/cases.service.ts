import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Case, CaseStatus } from './entities/case.entity';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { LocationsService } from '../locations/locations.service';

@Injectable()
export class CasesService {
    constructor(
        @InjectRepository(Case)
        private casesRepository: Repository<Case>,
        private locationsService: LocationsService,
    ) {}

    async findAll(
        skip = 0,
        take = 10,
        disease?: string,
        status?: CaseStatus,
        startDate?: Date,
        endDate?: Date,
    ): Promise<[Case[], number]> {
        const queryBuilder = this.casesRepository
            .createQueryBuilder('case')
            .leftJoinAndSelect('case.location', 'location')
            .skip(skip)
            .take(take);

        if (disease) {
            queryBuilder.andWhere('case.disease ILIKE :disease', { disease: `%${disease}%` });
        }

        if (status) {
            queryBuilder.andWhere('case.status = :status', { status });
        }

        if (startDate && endDate) {
            queryBuilder.andWhere('case.diagnosisDate BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        } else if (startDate) {
            queryBuilder.andWhere('case.diagnosisDate >= :startDate', { startDate });
        } else if (endDate) {
            queryBuilder.andWhere('case.diagnosisDate <= :endDate', { endDate });
        }

        return queryBuilder.getManyAndCount();
    }

    async findOne(id: string): Promise<Case> {
        const diseaseCase = await this.casesRepository.findOne({
            where: { id },
            relations: ['location'],
        });

        if (!diseaseCase) {
            throw new NotFoundException(`Case with ID "${id}" not found`);
        }

        return diseaseCase;
    }

    async create(createCaseDto: CreateCaseDto): Promise<Case> {
        // Verificăm dacă locația există
        await this.locationsService.findOne(createCaseDto.locationId);

        const newCase = this.casesRepository.create(createCaseDto);
        return this.casesRepository.save(newCase);
    }

    async update(id: string, updateCaseDto: UpdateCaseDto): Promise<Case> {
        const diseaseCase = await this.findOne(id);

        if (updateCaseDto.locationId) {
            // Verificăm dacă noua locație există
            await this.locationsService.findOne(updateCaseDto.locationId);
        }

        await this.casesRepository.update(id, updateCaseDto);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        const diseaseCase = await this.findOne(id);
        await this.casesRepository.remove(diseaseCase);
    }

    async findRecent(limit: number = 10): Promise<Case[]> {
        return this.casesRepository.find({
            relations: ['location'],
            order: { diagnosisDate: 'DESC' },
            take: limit,
        });
    }

    async getCasesByDisease(): Promise<any[]> {
        return this.casesRepository
            .createQueryBuilder('case')
            .select('case.disease', 'disease')
            .addSelect('COUNT(case.id)', 'count')
            .groupBy('case.disease')
            .orderBy('count', 'DESC')
            .getRawMany();
    }

    async getCasesByStatus(): Promise<any[]> {
        return this.casesRepository
            .createQueryBuilder('case')
            .select('case.status', 'status')
            .addSelect('COUNT(case.id)', 'count')
            .groupBy('case.status')
            .getRawMany();
    }

    async getCasesByLocation(): Promise<any[]> {
        return this.casesRepository
            .createQueryBuilder('case')
            .leftJoin('case.location', 'location')
            .select('location.id', 'locationId')
            .addSelect('location.name', 'locationName')
            .addSelect('COUNT(case.id)', 'count')
            .groupBy('location.id')
            .addGroupBy('location.name')
            .orderBy('count', 'DESC')
            .getRawMany();
    }

    async getCasesByTime(
        startDate: Date,
        endDate: Date,
        interval: 'day' | 'week' | 'month' = 'day',
    ): Promise<any[]> {
        try {
            // Abordare directă fără a folosi query builder complex
            let dateFormat;
            if (interval === 'day') {
                dateFormat = 'YYYY-MM-DD';
            } else if (interval === 'week') {
                dateFormat = 'YYYY-"W"IW';
            } else {
                dateFormat = 'YYYY-MM';
            }

            // Query direct cu parametri ordonați
            const query = `
                SELECT 
                  TO_CHAR("diagnosisDate", $1) AS "timeInterval", 
                  COUNT("id") AS "count" 
                FROM "cases" 
                WHERE "diagnosisDate" BETWEEN $2 AND $3 
                GROUP BY "timeInterval" 
                ORDER BY "timeInterval" ASC
            `;
            
            // Parametrii în ordinea utilizată în query ($1, $2, $3)
            const params = [dateFormat, startDate, endDate];
            
            // Executare query
            const results = await this.casesRepository.query(query, params);
            
            // Returnăm rezultate
            return results.map(result => ({
                timeInterval: result.timeInterval,
                count: result.count
            }));
        } catch (error) {
            console.error('Error in getCasesByTime:', error);
            return [];
        }
    }

    async getGeospatialData(): Promise<any[]> {
        return this.casesRepository
            .createQueryBuilder('case')
            .leftJoin('case.location', 'location')
            .select('location.latitude', 'latitude')
            .addSelect('location.longitude', 'longitude')
            .addSelect('COUNT(case.id)', 'intensity')
            .groupBy('location.latitude')
            .addGroupBy('location.longitude')
            .getRawMany();
    }
}