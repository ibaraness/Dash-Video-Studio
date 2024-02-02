export const Config = {
    upload: {
        baseDirectory: "videos",
        chunks: {
            directory: "chunks",
            SuccessfullyUploadedMessage: "Chunk uploaded successfully",
            errorMessage: "Error saving chunk",
        },
        merged: {
            directory: "merged_files",
            successfullyMerged: "Chunks merged successfully"
        }
    }
}