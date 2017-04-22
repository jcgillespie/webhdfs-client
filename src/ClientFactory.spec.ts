import { ClientFactory } from './ClientFactory';
import { WebHDFSClient } from './WebHDFSClient';
import { ClientOptions, DefaultClientOptions } from './ClientOptions';


describe('Client', () => {
    it('can be constructed', () => {
        let sut = ClientFactory.Create();
        expect(sut).toBeDefined();
    });
});

describe('Client factory', () => {
    it('should use the default options if none are supplied', () => {
        const client: WebHDFSClient = ClientFactory.Create();
        expect(client.Options).toBeDefined();
        expect(client.Options).toEqual(DefaultClientOptions);
    });

    it('should merge supplied values with the defaults', () => {
        const opts: ClientOptions = {
            Port: 1234
        };
        const client: WebHDFSClient = ClientFactory.Create(opts);
        expect(client.Options.Port).toEqual(opts.Port);
        expect(client.Options.Host).toEqual(DefaultClientOptions.Host);
        expect(client.Options.User).toEqual(DefaultClientOptions.User);
        expect(client.Options.Path).toEqual(DefaultClientOptions.Path);
        expect(client.Options.Protocol).toEqual(DefaultClientOptions.Protocol);
    });

    it('should take supplied values over the defaults', () => {
        const opts: ClientOptions = {
            Host: 'unittest.com',
            Path: 'I/changed/this/Path/',
            Port: 1234,
            Protocol: 'https',
            User: 'unit tester'
        };
        const client: WebHDFSClient = ClientFactory.Create(opts);
        expect(client.Options.Port).toEqual(opts.Port);
        expect(client.Options.Host).toEqual(opts.Host);
        expect(client.Options.User).toEqual(opts.User);
        expect(client.Options.Path).toEqual(opts.Path);
        expect(client.Options.Protocol).toEqual(opts.Protocol);
    });

    it('should allow user to remove defaults', () => {
        const opts: ClientOptions = <ClientOptions>{
            Host: undefined,
            Path: undefined,
            Port: undefined,
            Protocol: undefined,
            User: undefined
        };
        const client: WebHDFSClient = ClientFactory.Create(opts);
        expect(client.Options.Port).toBeUndefined();
        expect(client.Options.Host).toBeUndefined();
        expect(client.Options.User).toBeUndefined();
        expect(client.Options.Path).toBeUndefined();
        expect(client.Options.Protocol).toBeUndefined();
    });

    it('should allow user to supply only the Host value', () => {
        const opts: ClientOptions = {
            Host: 'unittest.com'
        };
        const client: WebHDFSClient = ClientFactory.Create(opts);
        expect(client.Options.Host).toEqual(opts.Host);
    });

    it('should allow user to supply only the Path value', () => {
        const opts: ClientOptions = {
            Path: 'unit/test/'
        };
        const client: WebHDFSClient = ClientFactory.Create(opts);
        expect(client.Options.Path).toEqual(opts.Path);
    });

    it('should allow user to supply only the user value', () => {
        const opts: ClientOptions = {
            User: 'Mr. Rogers'
        };
        const client: WebHDFSClient = ClientFactory.Create(opts);
        expect(client.Options.User).toEqual(opts.User);
    });

    it('should allow user to supply only the Protocol value', () => {
        const opts: ClientOptions = {
            Protocol: 'spdy'
        };
        const client: WebHDFSClient = ClientFactory.Create(opts);
        expect(client.Options.Protocol).toEqual(opts.Protocol);
    });

    it('should enforce a trailing slash on the base URI', () => {
        const opts: ClientOptions = {
            Path: '/unit/test/trailing/slash'
        };
        const client = ClientFactory.Create(opts) as WebHDFSClient;
        let result = client.BaseUri;
        expect(result[result.length - 1]).toBe('/');
    });

    it('should remove a leading slash from the Path', () => {
        const opts: ClientOptions = {
            Path: '/unit/test/trailing/slash'
        };
        const client = ClientFactory.Create(opts) as WebHDFSClient;
        let result = client.BaseUri;
        expect(result[0]).not.toBe('/');
    });
});
