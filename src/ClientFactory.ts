import { ClientOptions, DefaultClientOptions } from './ClientOptions';
import { WebHDFSClient } from './WebHDFSClient';
import { ReqFactory } from './RequestFactory';
import { Client } from './Client';

export class ClientFactory {
    public static DefaultClientOptions: ClientOptions = DefaultClientOptions;

    public static Create(options?: ClientOptions): WebHDFSClient {
        let r = new ReqFactory(options);
        return new Client(r);
    }
}
