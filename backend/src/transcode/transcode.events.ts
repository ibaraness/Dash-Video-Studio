export class PackageTranscodeDoneEvent {
    id: number; 
    file: string;
    fallbackFile: string;
    uniqueFolderName: string;
    userId: string;
}

export const PackageTranscodeDoneEventCreator = (id: number, file: string, fallbackFile: string, uniqueFolderName: string, userId: string) => {
    const packageTranscodeDoneEvent = new PackageTranscodeDoneEvent();
    packageTranscodeDoneEvent.id = id;
    packageTranscodeDoneEvent.file = file;
    packageTranscodeDoneEvent.fallbackFile = fallbackFile;
    packageTranscodeDoneEvent.uniqueFolderName = uniqueFolderName;
    packageTranscodeDoneEvent.userId = userId;
    return packageTranscodeDoneEvent;
}