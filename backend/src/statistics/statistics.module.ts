import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { CasesModule } from '../cases/cases.module';
import { LocationsModule } from '../locations/locations.module';

@Module({
    imports: [CasesModule, LocationsModule],
    providers: [StatisticsService],
    controllers: [StatisticsController],
    exports: [StatisticsService],
})
export class StatisticsModule {}