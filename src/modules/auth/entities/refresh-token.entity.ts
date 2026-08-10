import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('refresh_tokens')
export class RefreshTokenEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column()
    userId: string;

    @Index({ unique: true })
    @Column()
    jti: string;

    @Column({ type: 'varchar', length: 500 })
    token: string;

    @Column({ default: false })
    isRevoked: boolean;

    @Column()
    expiresAt: Date;

    @Column({ nullable: true })
    userAgent?: string;

    @Column({ nullable: true })
    clientIp?: string;

    @CreateDateColumn()
    createdAt: Date;
}
