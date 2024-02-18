import * as Minio from "minio";
import * as dotenv from 'dotenv';
dotenv.config();

export const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_HOST,
    port: Number(process.env.MINIO_PORT),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY, 
    secretKey: process.env.MINIO_SECRET_KEY 
});

export enum VideoBuckets {
    Dash = "dash-files",
    VideoChunks = 'video-chunks'
}




