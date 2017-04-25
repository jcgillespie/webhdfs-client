import * as stream from 'stream';
import { FileStatusProperties, ContentSummary, Token, FileChecksum } from './WebHDFSTypes';
import { Result, Outcome } from './Result';

export interface CreateFileOptions {
    BlockSize?: number;
    BufferSize?: number;
    PermissionOctal?: string;
    Overwrite?: boolean;
    Replication?: number;
}

export interface OpenFileOptions {
    Offset?: number;
    Length?: number;
    BufferSize?: number;
}

export interface WebHDFSClient {
    Append(file: stream.Stream, path: string, bufferSize?: number): Promise<Outcome>;
    CreateFile(
        file: stream.Stream,
        path: string,
        options?: CreateFileOptions
    ): Promise<Result<string>>;
    Delete(path: string, recursive?: boolean): Promise<Outcome>;
    Exists(path: string): Promise<Outcome>;
    GetContentSummary(path: string): Promise<Result<ContentSummary>>;
    GetDelegationToken(renewer: string): Promise<Result<Token>>;
    GetFileChecksum(path: string): Promise<Result<FileChecksum>>;
    GetFileStatus(path: string): Promise<Result<FileStatusProperties>>;
    GetHomeDirectory(): Promise<Result<string>>;
    ListStatus(path: string): Promise<Result<FileStatusProperties[]>>;
    MakeDirectory(path: string, permissionOctal?: string): Promise<Outcome>;
    OpenFile(
        path: string,
        options?: OpenFileOptions
    ): stream.Stream;
    Rename(source: string, destination: string): Promise<Outcome>;
}
