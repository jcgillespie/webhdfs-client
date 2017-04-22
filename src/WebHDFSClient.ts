import { ClientOptions } from './ClientOptions';
import { FileStatusProperties } from './WebHDFSTypes';

export interface WebHDFSClient {
    readonly Options: ClientOptions;
    readonly BaseUri: string;

    ListStatus(path: string): Promise<FileStatusProperties[]>;
}
