import { UUID } from 'crypto';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('videos')
export class Video {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ name: 'fileId', nullable: true })
    fileId: UUID;

    @Column({ name: 'name', length: 70, nullable: false })
    name: string;

    @Column({ name: 'description', nullable: true })
    description: string;

    @Column({ name: 'dash_file_path', nullable: true })
    dashFilePath: string;

    @Column({ name: 'fallback_video_path', nullable: true })
    fallbackVideoPath: string;

    @Column({ name: 'thumbnail', nullable: true })
    thumbnail: string;

    @Column({ name: 'metadata', nullable: false })
    metadata: string;

    @Column({ name: 'bucket', nullable: true })
    bucket: string;

    @Column({ name: 'status', nullable: false, default:1 })
    status: number;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createDateTime: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    lastChangedDateTime: Date;
}
