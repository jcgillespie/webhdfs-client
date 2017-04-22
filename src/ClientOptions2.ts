export interface ClientOptions {
    Host?: string;
    Path?: string;
    Port?: number;
    Protocol?: string;
    User?: string;
}

export const DefaultClientOptions: ClientOptions = {
    Host: 'localhost',
    Path: 'webhdfs/v1/',
    Port: 50070,
    Protocol: 'http',
    User: 'webuser'
};
