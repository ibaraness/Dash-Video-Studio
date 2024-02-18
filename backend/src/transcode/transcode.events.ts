export class PackageTranscodeDoneEvent {
    id: number; 
    file: string;
    fallbackFile: string;
    uniqueFolderName: string;
}

export const PackageTranscodeDoneEventCreator = (id: number, file: string, fallbackFile: string, uniqueFolderName: string) => {
    const packageTranscodeDoneEvent = new PackageTranscodeDoneEvent();
    packageTranscodeDoneEvent.id = id;
    packageTranscodeDoneEvent.file = file;
    packageTranscodeDoneEvent.fallbackFile = fallbackFile;
    packageTranscodeDoneEvent.uniqueFolderName = uniqueFolderName;
    return packageTranscodeDoneEvent;
}