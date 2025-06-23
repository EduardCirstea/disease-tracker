import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
    constructor(
        @InjectRepository(Location)
        private locationsRepository: Repository<Location>,
    ) {}

    async findAll(skip = 0, take = 10, search?: string): Promise<[Location[], number]> {
        const queryBuilder = this.locationsRepository
            .createQueryBuilder('location')
            .skip(skip)
            .take(take);

        if (search) {
            queryBuilder.where(
                'location.name ILIKE :search OR location.city ILIKE :search OR location.county ILIKE :search',
                { search: `%${search}%` },
            );
        }

        return queryBuilder.getManyAndCount();
    }

    async findOne(id: string): Promise<Location> {
        const location = await this.locationsRepository.findOne({ where: { id } });

        if (!location) {
            throw new NotFoundException(`Location with ID "${id}" not found`);
        }

        return location;
    }

    async create(createLocationDto: CreateLocationDto): Promise<Location> {
        const location = this.locationsRepository.create(createLocationDto);
        return this.locationsRepository.save(location);
    }

    async update(id: string, updateLocationDto: UpdateLocationDto): Promise<Location> {
        const location = await this.findOne(id);

        await this.locationsRepository.update(id, updateLocationDto);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        const location = await this.findOne(id);
        await this.locationsRepository.remove(location);
    }

    async getCounties(): Promise<string[]> {
        const counties = await this.locationsRepository
            .createQueryBuilder('location')
            .select('DISTINCT location.county', 'county')
            .orderBy('county', 'ASC')
            .getRawMany();

        return counties.map(item => item.county);
    }

    async getAllLocations(): Promise<Location[]> {
        return this.locationsRepository.find({
            select: ['id', 'name', 'city', 'county', 'country', 'latitude', 'longitude'],
        });
    }
}