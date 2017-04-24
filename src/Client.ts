import { IRequestFactory } from './RequestFactory';
import { WebHDFSClient } from './WebHDFSClient';
import { FileStatusProperties, ContentSummary } from './WebHDFSTypes';
import { Result } from './Result';

export class Client implements WebHDFSClient {
    private readonly req: IRequestFactory;
    constructor(requestFactory: IRequestFactory) {
        this.req = requestFactory;
    }

    public async ListStatus(path: string): Promise<Result<FileStatusProperties[]>> {
        interface ListStatusResponse {
            FileStatuses: {
                FileStatus: FileStatusProperties[]
            };
        }

        const op: string = 'LISTSTATUS';
        let raw: ListStatusResponse = await this.req.Get<ListStatusResponse>(op, path);
        return this.createResult<ListStatusResponse, FileStatusProperties[]>(raw, r => r.FileStatuses.FileStatus);
    }

    public async GetContentSummary(path: string): Promise<Result<ContentSummary>> {
        interface ContentSummaryResponse {
            ContentSummary: ContentSummary;
        }

        const op: string = 'GETCONTENTSUMMARY';
        let raw: ContentSummaryResponse = await this.req.Get<ContentSummaryResponse>(op, path);
        return this.createResult<ContentSummaryResponse, ContentSummary>(raw, r => r.ContentSummary);
    }

    private createResult<TRaw, TOut>(raw: TRaw, selector: (input: TRaw) => TOut): Result<TOut> {
        let result: Result<TOut> = {} as Result<TOut>;
        let selection = selector(raw);
        result.Valid = raw !== undefined && selection !== undefined;
        result.Result = selection;
        return result;
    }
}
