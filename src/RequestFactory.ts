import * as r from 'request';
import * as rp from 'request-promise-native';
import * as qs from 'qs';
import { ClientOptions, DefaultClientOptions } from './ClientOptions';

export interface IRequestFactory {
    readonly BaseUri: string;
    readonly BaseParameters: {};
    readonly Options: ClientOptions;
    BuildRequestUri(path?: string, params?: {}): string;
    Get<TReturn>(op: string, path?: string): Promise<TReturn>;
}


export class RequestFactory implements IRequestFactory {
    public readonly BaseUri: string;
    public readonly BaseParameters: {};
    public readonly Options: ClientOptions;

    private static createBaseUri(options: ClientOptions): string {
        if (options.Path !== undefined && options.Path !== null) {
            if (options.Path[options.Path.length - 1] !== '/') {
                options.Path = options.Path + '/';
            }

            if (options.Path[0] === '/') {
                options.Path = options.Path.substring(1);
            }
        }

        const uri = `${options.Protocol}://${options.Host}:${options.Port}/${options.Path}`;
        return uri;
    }

    constructor(options?: ClientOptions) {
        this.Options = { ...DefaultClientOptions, ...options };
        this.BaseUri = RequestFactory.createBaseUri(this.Options);
        this.BaseParameters = {
            'user.name': this.Options.User
        };
    }

    public BuildRequestUri(path?: string, params?: {}): string {
        path = path || '';
        if (path[0] === '/') {
            path = path.substr(1);
        }

        params = params || {};
        let reqparams: {} = { ...this.BaseParameters, ...params };
        let uri = `${this.BaseUri}${path}?${qs.stringify(reqparams)}`;
        return uri;
    }

    public async Get<TReturn>(op: string, path?: string): Promise<TReturn> {
        let params: {} = { op: op };
        let uri: string = this.BuildRequestUri(path, params);
        let config: r.CoreOptions = { json: true };
        return rp.get(uri, config);
    }
}
