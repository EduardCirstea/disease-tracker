import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateLocationDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    city: string;

    @IsNotEmpty()
    @IsString()
    county: string;

    @IsNotEmpty()
    @IsString()
    country: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    population?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    populationDensity?: number;
}