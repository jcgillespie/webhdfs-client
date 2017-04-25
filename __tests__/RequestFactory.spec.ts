import { ClientOptions, DefaultClientOptions } from '../src/ClientOptions';
import { RequestFactory, IRequestFactory } from '../src/RequestFactory';

describe('Request factory', () => {
    describe('options parsing', () => {
        it('should use the default options if none are supplied', () => {
            const factory: IRequestFactory = new RequestFactory();
            expect(factory.Options).toBeDefined();
            expect(factory.Options).toEqual(DefaultClientOptions);
        });

        it('should merge supplied values with the defaults', () => {
            const opts: ClientOptions = {
                Port: 1234
            };
            const factory: IRequestFactory = new RequestFactory(opts);
            expect(factory.Options.Host).toEqual(DefaultClientOptions.Host);
            expect(factory.Options.Path).toEqual(DefaultClientOptions.Path);
            expect(factory.Options.Port).toEqual(opts.Port);
            expect(factory.Options.Protocol).toEqual(DefaultClientOptions.Protocol);
            expect(factory.Options.User).toEqual(DefaultClientOptions.User);
        });

        it('should take supplied values over the defaults', () => {
            const opts: ClientOptions = {
                Host: 'unittest.com',
                Path: 'I/changed/this/Path/',
                Port: 1234,
                Protocol: 'https',
                User: 'unit tester'
            };
            const factory: IRequestFactory = new RequestFactory(opts);
            expect(factory.Options.Host).toEqual(opts.Host);
            expect(factory.Options.Path).toEqual(opts.Path);
            expect(factory.Options.Port).toEqual(opts.Port);
            expect(factory.Options.Protocol).toEqual(opts.Protocol);
            expect(factory.Options.User).toEqual(opts.User);
        });

        it('should allow user to remove defaults', () => {
            const opts: ClientOptions = <ClientOptions>{
                Host: undefined,
                Path: undefined,
                Port: undefined,
                Protocol: undefined,
                User: undefined
            };
            const factory: IRequestFactory = new RequestFactory(opts);
            expect(factory.Options.Host).toBeUndefined();
            expect(factory.Options.Path).toBeUndefined();
            expect(factory.Options.Port).toBeUndefined();
            expect(factory.Options.Protocol).toBeUndefined();
            expect(factory.Options.User).toBeUndefined();
        });

        it('should allow user to supply only the Host value', () => {
            const opts: ClientOptions = {
                Host: 'unit-test.org'
            };
            const factory: IRequestFactory = new RequestFactory(opts);
            expect(factory.Options.Host).toEqual(opts.Host);
        });

        it('should allow user to supply only the Path value', () => {
            const opts: ClientOptions = {
                Path: 'unit/test/path/'
            };
            const factory: IRequestFactory = new RequestFactory(opts);
            expect(factory.Options.Path).toEqual(opts.Path);
        });

        it('should allow user to supply only the user value', () => {
            const opts: ClientOptions = {
                User: 'SuperAdminUser'
            };
            const factory: IRequestFactory = new RequestFactory(opts);
            expect(factory.Options.User).toEqual(opts.User);
        });

        it('should allow user to supply only the Protocol value', () => {
            const opts: ClientOptions = {
                Protocol: 'webhdfs'
            };
            const factory: IRequestFactory = new RequestFactory(opts);
            expect(factory.Options.Protocol).toEqual(opts.Protocol);
        });

        it('should enforce a trailing slash on the base URI', () => {
            const opts: ClientOptions = {
                Path: '/test/trailing/slash'
            };

            const factory = new RequestFactory(opts);
            let result = factory.BaseUri;
            expect(result[result.length - 1]).toBe('/');
        });

        it('should remove a leading slash from the Path', () => {
            const opts: ClientOptions = {
                Path: '/test/leading/slash'
            };
            const factory = new RequestFactory(opts);
            let result = factory.BaseUri;
            expect(result[0]).not.toBe('/');
        });
    });

    describe('URI builder', () => {
        const opts: ClientOptions = {
            Host: 'unit.testing.com',
            Path: 'base/path',
            Port: 12345,
            Protocol: 'test',
            User: 'tester'
        };
        let requestFactory: IRequestFactory;
        beforeAll(() => {
            requestFactory = new RequestFactory(opts);
        });

        it('should strip a leading slash from the path', () => {
            let base = requestFactory.BaseUri;
            let result = requestFactory.BuildRequestUri('/should/not/lead/with/slash/');
            let path = result.replace(base, '');
            expect(path[0]).not.toBe('/');
        });
    });
});
