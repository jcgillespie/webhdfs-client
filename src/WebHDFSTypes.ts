export type FileStatusType = 'FILE' | 'DIRECTORY' | 'SYMLINK';

export interface FileStatusProperties {
    accessType: number;
    blockSize: number;
    group: string;
    length: number;
    modificationTime: number;
    owner: string;
    pathSuffix: string;
    permission: string;
    replication: number;
    symlink: string;
    type: FileStatusType;
}

export interface FileChecksum {
    algorithm: string;
    bytes: string;
    length: number;
}

export interface ContentSummary {
    directoryCount: number;
    fileCount: number;
    length: number;
    quota: number;
    spaceConsumed: number;
    spaceQuota: number;
}

export interface BooleanResponse {
    boolean: boolean;
}

export interface Token {
    urlString: string;
}
