export class PackageTranscodeDoneEvent {
    id: string; 
    file: string;
    fallbackFile: string;
    uniqueFolderName: string;
    userId: string;
    userName: string;
}

export const PackageTranscodeDoneEventCreator = (id: string, file: string, fallbackFile: string, uniqueFolderName: string, userId: string, userName:string) => {
    const packageTranscodeDoneEvent = new PackageTranscodeDoneEvent();
    packageTranscodeDoneEvent.id = id;
    packageTranscodeDoneEvent.file = file;
    packageTranscodeDoneEvent.fallbackFile = fallbackFile;
    packageTranscodeDoneEvent.uniqueFolderName = uniqueFolderName;
    packageTranscodeDoneEvent.userId = userId;
    packageTranscodeDoneEvent.userName = userName;
    return packageTranscodeDoneEvent;
}