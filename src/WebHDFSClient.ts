import { ClientOptions, DefaultClientOptions } from './ClientOptions';

export interface WebHDFSClient {
    readonly Options: ClientOptions;
    readonly BaseUri: string;
}
