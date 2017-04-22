import { ClientOptions } from './ClientOptions';

export interface WebHDFSClient {
    readonly Options: ClientOptions;
    readonly BaseUri: string;
}
