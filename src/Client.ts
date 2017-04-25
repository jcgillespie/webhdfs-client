import * as stream from 'stream';
import { CoreOptions, RequestResponse } from 'request';
import { RequestPromiseOptions, put } from 'request-promise-native';
import { IRequestFactory } from './RequestFactory';
import { WebHDFSClient, CreateFileOptions, OpenFileOptions } from './WebHDFSClient';
import { FileStatusProperties, ContentSummary, Token, FileChecksum, BooleanResponse } from './WebHDFSTypes';
import { Result, Outcome } from './Result';

export class Client implements WebHDFSClient {
    private readonly req: IRequestFactory;
    constructor(requestFactory: IRequestFactory) {
        this.req = requestFactory;
    }

    public async CreateFile(
        file: stream.Stream,
        path: string,
        options?: CreateFileOptions
    ): Promise<Result<string>> {
        const op: string = 'CREATE';
        const locHeader: string = 'location';

        options = options || {};
        let parameters: {} = {
            blocksize: options.BlockSize,
            buffersize: options.BufferSize,
            overwrite: options.Overwrite,
            permission: options.PermissionOctal,
            replication: options.Replication,
            op: op,
            noredirect: true
        };

        let requestOpts: RequestPromiseOptions = {
            followRedirect: false,
            followAllRedirects: false,
            resolveWithFullResponse: true,
            simple: false
        };

        let success: boolean = false;
        let location: string = '';
        try {
            // two-part creation per docs
            // reference: https://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/WebHDFS.html#Create_and_Write_to_a_File
            let uri = this.req.BuildRequestUri(path, parameters);
            let req1: RequestResponse = await put(uri, requestOpts);
            let dataUri = req1.headers[locHeader];

            let req2 = put(dataUri, requestOpts);
            file.pipe(req2);

            let response: RequestResponse = await req2;
            location = response.headers[locHeader];
            success = location !== null;
        } catch (error) {
            success = false;
        }

        let result = new Result<string>();
        result.Success = success;
        result.Result = result.Success ? location : undefined;
        return result;
    }

    public async GetContentSummary(path: string): Promise<Result<ContentSummary>> {
        interface ContentSummaryResponse {
            ContentSummary: ContentSummary;
        }

        const op: string = 'GETCONTENTSUMMARY';
        let raw: ContentSummaryResponse = await this.req.GetOp<ContentSummaryResponse>(op, path);
        return this.createResult<ContentSummaryResponse, ContentSummary>(raw, r => r.ContentSummary);
    }

    public async GetDelegationToken(renewer: string): Promise<Result<Token>> {
        interface DelegationTokenResponse {
            Token: Token;
        }

        const op: string = 'GETDELEGATIONTOKEN';
        let params = { op: op, renewer: renewer };
        let config: CoreOptions = { json: true };
        let raw = await this.req.Get<DelegationTokenResponse>(params, config);
        return this.createResult<DelegationTokenResponse, Token>(raw, r => r.Token);
    }

    public async GetFileChecksum(path: string): Promise<Result<FileChecksum>> {
        interface FileChecksumResponse {
            FileChecksum: FileChecksum;
        }

        const op: string = 'GETFILECHECKSUM';
        let raw = await this.req.GetOp<FileChecksumResponse>(op, path);
        return this.createResult<FileChecksumResponse, FileChecksum>(raw, r => r.FileChecksum);
    }

    public async GetFileStatus(path: string): Promise<Result<FileStatusProperties>> {
        interface FileStatus {
            FileStatus: FileStatusProperties;
        }

        const op: string = 'GETFILESTATUS';
        let raw = await this.req.GetOp<FileStatus>(op, path);
        return this.createResult<FileStatus, FileStatusProperties>(raw, r => r.FileStatus);
    }

    public async GetHomeDirectory(): Promise<Result<string>> {
        interface HomeDirectoryResponse {
            Path: string;
        }

        const op: string = 'GETHOMEDIRECTORY';
        let raw: HomeDirectoryResponse = await this.req.GetOp<HomeDirectoryResponse>(op);
        return this.createResult<HomeDirectoryResponse, string>(raw, r => r.Path);
    }

    public async ListStatus(path: string): Promise<Result<FileStatusProperties[]>> {
        interface ListStatusResponse {
            FileStatuses: {
                FileStatus: FileStatusProperties[]
            };
        }

        const op: string = 'LISTSTATUS';
        let raw: ListStatusResponse = await this.req.GetOp<ListStatusResponse>(op, path);
        return this.createResult<ListStatusResponse, FileStatusProperties[]>(raw, r => r.FileStatuses.FileStatus);
    }

    public async MakeDirectory(path: string, permissionOctal?: string): Promise<Outcome> {
        const op: string = 'MKDIRS';
        let reqParams = { op, permission: permissionOctal };
        let config: CoreOptions = { json: true };
        let raw = await this.req.Put<BooleanResponse>(reqParams, config, path);
        return this.createOutcome<BooleanResponse>(raw, r => r.boolean);
    }

    public OpenFile(
        path: string,
        options?: OpenFileOptions
    ): stream.Stream {
        options = options || {};
        let param: {} = {
            op: 'OPEN',
            buffersize: options.BufferSize,
            length: options.Length,
            offset: options.Offset,
        };

        let coreOptions: CoreOptions = {
            followRedirect: true
        };

        return this.req.GetStream(param, coreOptions, path);
    }

    private createResult<TRaw, TOut>(raw: TRaw, selector: (input: TRaw) => TOut): Result<TOut> {
        let result: Result<TOut> = new Result<TOut>();
        let selection = selector(raw);
        result.Success = raw !== undefined && selection !== undefined;
        result.Result = selection;
        return result;
    }

    private createOutcome<TRaw>(raw: TRaw, isValid: (input: TRaw) => boolean): Outcome {
        let result: Outcome = new Outcome();
        result.Success = isValid(raw);
        return result;
    }
}
