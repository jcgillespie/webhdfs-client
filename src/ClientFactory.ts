import { ClientOptions, DefaultClientOptions } from './ClientOptions';
import { WebHDFSClient } from './WebHDFSClient';
import { RequestFactory } from './RequestFactory';
import { Client } from './Client';

export class ClientFactory {
    public static DefaultClientOptions: ClientOptions = DefaultClientOptions;

    public static Create(options?: ClientOptions): WebHDFSClient {
        let r = new RequestFactory(options);
        return new Client(r);
    }
}
