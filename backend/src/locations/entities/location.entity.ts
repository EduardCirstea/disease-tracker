// src/locations/entities/location.entities.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import {Case} from "../../cases/entities/case.entity";

@Entity('locations')
export class Location {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    city: string;

    @Column()
    county: string;

    @Column()
    country: string;

    @Column('decimal', { precision: 10, scale: 7 })
    latitude: number;

    @Column('decimal', { precision: 10, scale: 7 })
    longitude: number;

    @Column({ nullable: true })
    population: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    populationDensity: number;

    @OneToMany(() => Case, (diseaseCase) => diseaseCase.location)
    cases: Case[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}