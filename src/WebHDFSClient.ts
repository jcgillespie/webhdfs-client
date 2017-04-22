import { ClientOptions, DefaultClientOptions } from './clientOptions';

export interface WebHDFSClient {
    readonly Options: ClientOptions;
    readonly BaseUri: string;
}
