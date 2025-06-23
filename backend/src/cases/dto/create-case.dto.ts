import { IsNotEmpty, IsEnum, IsArray, IsString, IsInt, IsDateString, IsOptional, IsUUID, Min, Max } from 'class-validator';
import {CaseStatus} from "../entities/case.entity";

export class CreateCaseDto {
    @IsNotEmpty()
    @IsString()
    patientId: string;

    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Max(120)
    age: number;

    @IsNotEmpty()
    @IsString()
    gender: string;

    @IsNotEmpty()
    @IsString()
    disease: string;

    @IsArray()
    @IsString({ each: true })
    symptoms: string[];

    @IsNotEmpty()
    @IsDateString()
    diagnosisDate: string;

    @IsNotEmpty()
    @IsEnum(CaseStatus)
    status: CaseStatus;

    @IsNotEmpty()
    @IsUUID()
    locationId: string;

    @IsOptional()
    @IsString()
    notes?: string;
}