// src/cases/entities/case.entities.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Location } from '../../locations/entities/location.entity';

export enum CaseStatus {
    SUSPECTED = 'suspected',
    CONFIRMED = 'confirmed',
    RECOVERED = 'recovered',
    DECEASED = 'deceased',
}

@Entity('cases')
export class Case {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    patientId: string;

    @Column()
    age: number;

    @Column()
    gender: string;

    @Column()
    disease: string;

    @Column('simple-array')
    symptoms: string[];

    @Column({ type: 'date' })
    diagnosisDate: Date;

    @Column({
        type: 'enum',
        enum: CaseStatus,
        default: CaseStatus.CONFIRMED,
    })
    status: CaseStatus;

    @ManyToOne(() => Location, (location) => location.cases)
    @JoinColumn({ name: 'locationId' })
    location: Location;

    @Column()
    locationId: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}