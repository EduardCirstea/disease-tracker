import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { AdminLocationsController } from './admin-locations.controller';
import { Location } from './entities/location.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Location])],
    providers: [LocationsService],
    controllers: [LocationsController, AdminLocationsController],
    exports: [LocationsService],
})
export class LocationsModule {}