import * as stream from 'stream';
import { CoreOptions } from 'request';
import { IRequestFactory } from './RequestFactory';
import { WebHDFSClient } from './WebHDFSClient';
import { FileStatusProperties, ContentSummary, Token, FileChecksum } from './WebHDFSTypes';
import { Result } from './Result';

export class Client implements WebHDFSClient {
    private readonly req: IRequestFactory;
    constructor(requestFactory: IRequestFactory) {
        this.req = requestFactory;
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

    public OpenFile(
        path: string,
        offset?: number,
        length?: number,
        bufferSize?: number,
        noRedirect?: boolean
    ): stream.Stream {
        let param: {} = {
            op: 'OPEN',
            buffersize: bufferSize,
            length: length,
            noredirect: noRedirect,
            offset: offset
        };

        let options: CoreOptions = {
            followRedirect: true
        };

        return this.req.GetStream(param, options, path);
    }

    private createResult<TRaw, TOut>(raw: TRaw, selector: (input: TRaw) => TOut): Result<TOut> {
        let result: Result<TOut> = {} as Result<TOut>;
        let selection = selector(raw);
        result.Valid = raw !== undefined && selection !== undefined;
        result.Result = selection;
        return result;
    }
}
