import { Injectable } from "@nestjs/common"
import { v4 as uuidv4 } from 'uuid';
import { VideoBuckets, minioClient } from "./storage.config";
import { UploadedObjectInfo } from "minio";
import { LoggerService } from "src/logger/logger.service";
import * as path from "path";
import fs = require("fs");
import { annonymousReadPolicy } from "./anonymous-read.policy";

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
      const policy = annonymousReadPolicy(VideoBuckets.Dash);
      await minioClient.setBucketPolicy(VideoBuckets.Dash, policy);

    } catch (e) {
      this.logger.error("Error initiating storage buckets", e, "StorageService");
    }
  }

  async createBucket(name: string) {
    try {
      this.logger.debug("attempting to create bucket", "StorageService");
      const exist = await minioClient.bucketExists(name);
      if (exist) {
        return;
      }
      await minioClient.makeBucket(name, 'us-east-1');
      const policy = annonymousReadPolicy(name);
      await minioClient.setBucketPolicy(name, policy);
    } catch (e) {
      this.logger.error("Error creating bucket", e, "StorageService");
    }
  }

  getEndPoint() {
    const host = process?.env?.MINIO_EXTERNAL_HOST || "localhost";
    const port = process?.env?.MINIO_PORT || "9000";
    const protocol = process.env.NEST_MODE === "prod" ? 'https' : 'http';
    return port !== "80" ? `${protocol}://${host}:${port}` : `${protocol}://${host}:${port}`
  }

  async uploadFile(dashBucket: string, filename: string, filepath: string): Promise<UploadFileResponse> {
    try {
      const res = await minioClient.fPutObject(dashBucket, filename, filepath);
      const url = `${this.getEndPoint()}/${dashBucket}/${filename}`;
      this.logger.debug(`uploadFile() URL:${url}`, StorageService.name);
      return {
        ...res,
        url
      }
    } catch (e) {
      this.logger.error("Error uploading file", e, "StorageService");
    }
  }

  async deleteFiles(bucket: string, folderName: string) {
    var objectsList = []

    // List all object paths in bucket my-bucketname.
    var objectsStream = minioClient.listObjects(bucket, folderName, true)

    objectsStream.on('data', function (obj) {
      objectsList.push(obj.name)
    })

    objectsStream.on('error', (e) => {
      this.logger.error("Error delete files", JSON.stringify(e), StorageService.name);
    })

    objectsStream.on('end',  () => {
      minioClient.removeObjects(bucket, objectsList,  (e) => {
        if (e) {
          this.logger.error("Unable to remove Objects", JSON.stringify(e), StorageService.name);
          throw new Error("Unable to remove Objects");
          return;
        }
        this.logger.log('Removed the objects successfully', StorageService.name);
      })
    })
  }

  async uploadFolder(dashBucket: string, folderPath: string, outputFolderName?: string): Promise<{ url: string }> {

    if (!fs.existsSync(folderPath)) {
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
    this.logger.debug(`uploadFolder() URL:${url}`, StorageService.name);
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