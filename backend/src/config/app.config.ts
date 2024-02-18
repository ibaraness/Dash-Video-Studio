export const Config = {
    upload: {
        baseDirectory: "videos",
        chunks: {
            directory: "chunks",
            SuccessfullyUploadedMessage: "Chunk uploaded successfully",
            errorMessage: "Error saving chunk",
        },
        merged: {
            directory: "original_file",
            successfullyMerged: "Chunks merged successfully"
        },
        screnshots: {
            width: 1280,
            height:720
        }
    }
}