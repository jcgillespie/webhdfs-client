import { ClientOptions, DefaultClientOptions } from './clientOptions';
import { WebHDFSClient } from './WebHDFSClient';

export class ClientFactory {
    public static DefaultClientOptions: ClientOptions;

    public static Create(options?: ClientOptions): WebHDFSClient {
        const opts: ClientOptions = { ...DefaultClientOptions, ...options };
        return new Client(opts);
    }
}

class Client implements WebHDFSClient {
    public readonly BaseUri: string = undefined;
    constructor(public Options: ClientOptions) {
        this.BaseUri = this.createBaseUri();
    }

    private createBaseUri(): string {
        if (this.Options.Path !== undefined && this.Options.Path !== null) {
            if (this.Options.Path[this.Options.Path.length - 1] !== '/') {
                this.Options.Path = this.Options.Path + '/';
            }

            if (this.Options.Path[0] === '/') {
                this.Options.Path = this.Options.Path.substring(1);
            }
        }
        const uri = `${this.Options.Protocol}://${this.Options.Host}:${this.Options.Port}/${this.Options.Path}`;

        return uri;
    }
}
