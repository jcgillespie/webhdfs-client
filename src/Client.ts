import * as stream from 'stream';
import { CoreOptions, RequestResponse } from 'request';
import { RequestPromiseOptions, put, post } from 'request-promise-native';
import { IRequestFactory } from './RequestFactory';
import { WebHDFSClient, CreateFileOptions, OpenFileOptions } from './WebHDFSClient';
import { FileStatusProperties, ContentSummary, Token, FileChecksum, BooleanResponse } from './WebHDFSTypes';
import { Result, Outcome } from './Result';

export class Client implements WebHDFSClient {
    private readonly jsonOpt: CoreOptions = { json: true };
    private readonly req: IRequestFactory;
    constructor(requestFactory: IRequestFactory) {
        this.req = requestFactory;
    }

    public async Append(file: stream.Stream, path: string, bufferSize?: number): Promise<Outcome> {
        const op: string = 'APPEND';
        const locHeader: string = 'location';
        const reqParams = { op, bufferSize };
        const uri = this.req.BuildRequestUri(path, reqParams);

        return this.wrapOutcome(async () => {
            // two-part creation per docs
            // reference: http://hadoop.apache.org/docs/current/hadoop-project-dist/hadoop-hdfs/WebHDFS.html#Append_to_a_File
            let request1: RequestResponse = await post(uri, this.jsonOpt);
            const dataUri = request1.headers[locHeader];

            let request2 = post(dataUri, this.jsonOpt);
            file.pipe(request2);

            await request2;
            return true;
        });
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
        result.Result = location;
        return result;
    }

    public async Delete(path: string, recursive: boolean = false): Promise<Outcome> {
        const op: string = 'DELETE';
        const reqParams = { op, recursive };
        return this.wrapOutcome(async () => {
            let raw = await this.req.Delete<BooleanResponse>(reqParams, this.jsonOpt, path);
            return raw.boolean;
        });
    }

    public async Exists(path: string): Promise<Outcome> {
        return this.wrapOutcome(async () => {
            let stat = await this.GetFileStatus(path);
            return stat !== undefined && stat.Success;
        });
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

        let raw = await this.req.Get<DelegationTokenResponse>(params, this.jsonOpt);
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
        return this.wrapOutcome(async () => {
            let raw = await this.req.Put<BooleanResponse>(reqParams, this.jsonOpt, path);
            return raw.boolean;
        });
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

    public async Rename(source: string, destination: string): Promise<Outcome> {
        const op: string = 'RENAME';
        let reqParam = { op, destination };
        return this.wrapOutcome(async () => {
            let raw = await this.req.Put<BooleanResponse>(reqParam, this.jsonOpt, source);
            return raw.boolean;
        });
    }

    private createResult<TRaw, TOut>(raw: TRaw, selector: (input: TRaw) => TOut): Result<TOut> {
        let result: Result<TOut> = new Result<TOut>();
        let selection = selector(raw);
        result.Success = raw !== undefined && selection !== undefined;
        result.Result = selection;
        return result;
    }

    private async wrapOutcome(action: () => Promise<boolean>): Promise<Outcome> {
        let outcome = new Outcome();
        try {
            outcome.Success = await action();
        } catch (error) {
            outcome.Success = false;
        }
        return outcome;
    }
}
