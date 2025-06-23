import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';
import { AdminCasesController } from './admin-cases.controller';
import { Case } from './entities/case.entity';
import { LocationsModule } from '../locations/locations.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Case]),
        LocationsModule,
    ],
    providers: [CasesService],
    controllers: [CasesController, AdminCasesController],
    exports: [CasesService],
})
export class CasesModule {}