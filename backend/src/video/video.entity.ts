import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('videos')
export class Video {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'name', length: 70, nullable: false })
    name: string;

    @Column({ name: 'path', nullable: false })
    path: string;

    @Column({ name: 'thumbnail', nullable: true })
    thumbnail: string;

    @Column({ name: 'metadata', nullable: false })
    metadata: string;

    @Column({ name: 'transcode', nullable: true })
    transcode: string;
}
