import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('videos')
export class Video {
    @PrimaryGeneratedColumn()
    id: number;

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

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createDateTime: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    lastChangedDateTime: Date;
}
