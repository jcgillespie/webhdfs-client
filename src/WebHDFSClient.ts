import * as stream from 'stream';
import { FileStatusProperties, ContentSummary, Token, FileChecksum } from './WebHDFSTypes';
import { Result } from './Result';

export interface WebHDFSClient {
    GetContentSummary(path: string): Promise<Result<ContentSummary>>;
    GetDelegationToken(renewer: string): Promise<Result<Token>>;
    GetFileChecksum(path: string): Promise<Result<FileChecksum>>;
    GetFileStatus(path: string): Promise<Result<FileStatusProperties>>;
    GetHomeDirectory(): Promise<Result<string>>;
    ListStatus(path: string): Promise<Result<FileStatusProperties[]>>;
    OpenFile(
        path: string,
        offset?: number,
        length?: number,
        bufferSize?: number,
        noRedirect?: boolean
    ): stream.Stream;
}
