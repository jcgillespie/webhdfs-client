import * as stream from 'stream';
import { CoreOptions, get as getRequest } from 'request';
import { get, put } from 'request-promise-native';
import { stringify } from 'qs';
import { ClientOptions, DefaultClientOptions } from './ClientOptions';

export interface IRequestFactory {
    readonly BaseUri: string;
    readonly BaseParameters: {};
    readonly Options: ClientOptions;
    BuildRequestUri(path?: string, params?: {}): string;
    Get<TReturn>(reqParams: {}, config: CoreOptions, path?: string): Promise<TReturn>;
    GetOp<TReturn>(op: string, path?: string): Promise<TReturn>;
    GetStream(reqParams: {}, config: CoreOptions, path: string): stream.Stream;
    Put<TReturn>(reqParams: {}, config: CoreOptions, path?: string): Promise<TReturn>;
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
        let uri = `${this.BaseUri}${path}?${stringify(reqparams)}`;
        return uri;
    }

    public async Get<TReturn>(reqParams: {}, config: CoreOptions, path?: string): Promise<TReturn> {
        let uri: string = this.BuildRequestUri(path, reqParams);
        return get(uri, config);
    }

    public async GetOp<TReturn>(op: string, path?: string): Promise<TReturn> {
        let params: {} = { op: op };
        let config: CoreOptions = { json: true };
        return this.Get<TReturn>(params, config, path);
    }

    public GetStream(reqParams: {}, config: CoreOptions, path: string): stream.Stream {
        let uri: string = this.BuildRequestUri(path, reqParams);
        return getRequest(uri, config);
    }

    public async Put<TReturn>(reqParams: {}, config: CoreOptions, path?: string): Promise<TReturn> {
        let uri: string = this.BuildRequestUri(path, reqParams);
        return put(uri, config);
    }
}
