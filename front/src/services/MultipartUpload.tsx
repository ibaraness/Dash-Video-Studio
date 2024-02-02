export interface ProgressPayload {
    percent: number;
    chunkNumber: number;
    totalChunks: number;
}

interface VideoStatusResponse {
    status: string;
    message: string;
    id: number;
}

export const multipartUpload = (
    largeFile: File,
    onProgres?: (event: ProgressPayload) => void,
    onSuccess?: (event: VideoStatusResponse) => void
) => {
    if (!largeFile) {
        throw new Error("Please select a file to upload.");
    }

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
        id:0
    };

    const uploadNextChunk = async () => {
        

        if (chunkNumber < totalChunks) {
            const chunk = largeFile.slice(start, end);
            const formData = new FormData();
            formData.append("file", chunk);
            formData.append("chunkNumber", String(chunkNumber));
            formData.append("totalChunks", String(totalChunks));
            formData.append("originalname", largeFile.name);

            try {
                const res = await fetch("http://localhost:3000/video", {
                    method: "POST",
                    body: formData,
                });
                progress = await res.json();
                // console.log(progress);
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
            if(onSuccess){
                onSuccess(progress!);
            }
        }
    };

    uploadNextChunk();
};



