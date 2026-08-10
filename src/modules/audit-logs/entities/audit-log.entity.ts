import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLogEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column()
    traceId: string;

    @Index()
    @Column({ nullable: true })
    userId: string;

    @Index()
    @Column()
    module: string;

    @Index()
    @Column()
    action: string;

    @Column({ nullable: true })
    description: string;

    @Column()
    method: string;

    @Column()
    path: string;

    @Column()
    ip: string;

    @Column()
    statusCode: number;

    @Column()
    durationMs: number;

    @Index()
    @CreateDateColumn()
    createdAt: Date;
}
