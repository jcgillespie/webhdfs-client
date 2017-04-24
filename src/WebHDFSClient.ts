import { FileStatusProperties, ContentSummary } from './WebHDFSTypes';
import { Result } from './Result';

export interface WebHDFSClient {
    ListStatus(path: string): Promise<Result<FileStatusProperties[]>>;
    GetContentSummary(path: string): Promise<Result<ContentSummary>>;
}
