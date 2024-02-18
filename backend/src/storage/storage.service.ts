import { Injectable } from "@nestjs/common"
import { v4 as uuidv4 } from 'uuid';
import { VideoBuckets, minioClient } from "./storage.config";
import { UploadedObjectInfo } from "minio";
import { publicReadPolicy } from "./storage-bucket.policy";
import { LoggerService } from "src/logger/logger.service";
import * as path from "path";
import fs = require("fs");

interface UploadFileResponse extends UploadedObjectInfo {
  url: string;
}

@Injectable()
export class StorageService {

  constructor(private logger: LoggerService) {
    this.initializeBuckets();
  }

  async initializeBuckets() {
    try {
      this.logger.debug("Initiating storage buckets", "StorageService");
      const exist = await minioClient.bucketExists(VideoBuckets.Dash);
      if (exist) {
        return;
      }
      await minioClient.makeBucket(VideoBuckets.Dash, 'us-east-1');
      await minioClient.setBucketPolicy(VideoBuckets.Dash, JSON.stringify(publicReadPolicy))

    } catch (e) {
      console.error(e);
      this.logger.error("Error initiating storage buckets", e, "StorageService");
    }
  }

  getEndPoint() {
    const host = process?.env?.MINIO_HOST || "localhost";
    const port = process?.env?.MINIO_PORT || "9000";
    const protocol = process.env.NEST_MODE === "prod" ? 'https' : 'http';
    return port !== "80" ? `${protocol}://${host}:${port}` : `${protocol}://${host}:${port}`
  }

  async uploadFile(dashBucket: string, filename: string, filepath: string): Promise<UploadFileResponse> {
    const res = await minioClient.fPutObject(dashBucket, filename, filepath);
    const url = `${this.getEndPoint()}/${dashBucket}/${filename}`;
    return {
      ...res,
      url
    }
  }

  async uploadFolder(dashBucket: string, folderPath: string, outputFolderName?: string): Promise<{url:string}> {

    if(!fs.existsSync(folderPath)){
      throw new Error("Folder does not exist in that path");
    }
    const files = fs.readdirSync(folderPath);
    const uniquePath = outputFolderName ? outputFolderName : uuidv4();

    if (files) {
      for (let i = 0; i < files.length; i++) {
        const enrichedPath = path.join(uniquePath, files[i]);
        const filePath = path.join(folderPath, files[i]);
        const storage = await this.uploadFile(dashBucket, enrichedPath, filePath);
      }
    }
    const url = `${this.getEndPoint()}/${dashBucket}/${uniquePath}`;
    return {
      url
    }
  }

  async uploadFileWithFolder(dashBucket: string, folderName: string, filename: string, filepath: string): Promise<UploadFileResponse> {
    const filenameWithFolder = `${folderName}/${filename}`;
    const res = await this.uploadFile(dashBucket, filenameWithFolder, filepath);
    const url = `${this.getEndPoint()}/${dashBucket}/${folderName}/${filename}`;
    return {
      ...res,
      url
    }
  }

  async uploadWithUniquePath(dashBucket: string, filename: string, filepath: string): Promise<UploadedObjectInfo> {
    const uniquePath = this.getUniqueFilePath(filename);
    return this.uploadFile(dashBucket, uniquePath, filepath)
  }

  getUniqueFilePath(filename: string): string {
    // Generate UUID for file
    const myuuid = uuidv4();
    const sanitizeName = this.sanitizeFilename(filename);
    return `${myuuid}/${sanitizeName}`;
  }

  private sanitizeFilename(filename: string) {
    const regex = /[\^\*\|\\\/\&\"\;]/gm
    return filename.replace(regex, '')
  }
}