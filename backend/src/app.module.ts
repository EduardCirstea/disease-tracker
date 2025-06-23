// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CasesModule } from './cases/cases.module';
import { LocationsModule } from './locations/locations.module';
import { StatisticsModule } from './statistics/statistics.module';
import { UsersService } from './users/users.service';
import { UserRole } from './users/entities/user.entity';
import { User } from './users/entities/user.entity';
import { Case } from './cases/entities/case.entity';
import { Location } from './locations/entities/location.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'infectious_diseases'),
        entities: [User, Case, Location, __dirname + '/**/*.entities{.ts,.js}'],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
      }),
    }),
    AuthModule,
    UsersModule,
    CasesModule,
    LocationsModule,
    StatisticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'ADMIN_INIT',
      useFactory: async (usersService: UsersService, configService: ConfigService) => {
        const adminEmail = configService.get('ADMIN_EMAIL');
        const adminPassword = configService.get('ADMIN_PASSWORD');
        const adminFirstName = configService.get('ADMIN_FIRST_NAME');
        const adminLastName = configService.get('ADMIN_LAST_NAME');

        if (adminEmail && adminPassword) {
          const existingAdmin = await usersService.findOneByEmail(adminEmail);
          if (!existingAdmin) {
            await usersService.create({
              email: adminEmail,
              password: adminPassword,
              firstName: adminFirstName,
              lastName: adminLastName,
              role: UserRole.ADMIN,
            });
            console.log('Admin user created successfully');
          }
        }
      },
      inject: [UsersService, ConfigService],
    },
  ],
})
export class AppModule {}