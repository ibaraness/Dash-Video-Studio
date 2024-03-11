import { AppConfig } from "../app/config/config";
import { v4 as uuidv4 } from 'uuid';
import { ProgressPayload, VideoStatusResponse } from "./MultipartUpload.model";
import authHttpService from "./restApi/authHTTPService";

export const multipartUpload = (
    largeFile: File,
    onProgres?: (event: ProgressPayload) => void,
    onSuccess?: (event: VideoStatusResponse) => void
) => {
    if (!largeFile) {
        throw new Error("Please select a file to upload.");
    }

    const base = AppConfig.API.baseURL;
    const uploadSlice = AppConfig.API.uploadKey;

    const uploadURL = `${base}/${uploadSlice}`; 

    // Set upload ID to keep upload stateless
    const uploadId = uuidv4();

    let percent = 0;
    const chunkSize = 5 * (1024 ** 2); // 5MB (adjust based on your requirements)
    const totalChunks = Math.ceil(largeFile.size / chunkSize);
    const percentUnit = 100 / totalChunks;
    let chunkNumber = 0;
    let start = 0;
    let end = chunkSize;
    if (onProgres) {
        onProgres({ percent, chunkNumber, totalChunks });
    }

    let progress: VideoStatusResponse = {
        status: "idle",
        message: "pending start",
        id: 0
    };

    const uploadNextChunk = async () => {


        if (chunkNumber < totalChunks) {
            const chunk = largeFile.slice(start, end);
            const formData = new FormData();
            formData.append("file", chunk);
            formData.append("chunkNumber", String(chunkNumber));
            formData.append("totalChunks", String(totalChunks));
            formData.append("originalname", largeFile.name);
            formData.append("uploadId", uploadId);

            try {
                const res = await authHttpService.post<FormData, VideoStatusResponse>(uploadURL, formData)
                progress = res.data!;

                percent = Number((chunkNumber + 1) * percentUnit);
                chunkNumber++;
                start = end;
                end = start + chunkSize;
                if (onProgres) {
                    onProgres({ percent, chunkNumber, totalChunks });
                }
                uploadNextChunk();
            } catch (error) {
                console.error("Error uploading chunk:", error);
            }
        } else {
            percent = 100;
            if (onProgres) {
                onProgres({ percent, chunkNumber, totalChunks });
            }
            if (onSuccess) {
                onSuccess(progress!);
            }
        }
    };

    uploadNextChunk();
};



