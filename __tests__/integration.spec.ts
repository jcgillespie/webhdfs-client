jest.disableAutomock();

import * as sb from 'stream-buffers';
import { StatusCodeError } from 'request-promise-native/errors';
import { ClientFactory } from '../src/ClientFactory';
import { WebHDFSClient } from '../src/WebHDFSClient';

describe('INTEGRATION', () => {
    it('throws 404 error when not found.', async () => {
        const path = 'integration/DoesNotExist.txt';
        const client: WebHDFSClient = ClientFactory.Create({
            Host: 'localhost',
            Port: 50070,
            Path: 'webhdfs/v1/testing/'
        });

        let result = await client.GetFileStatus(path);
        expect(result.Success).toBe(false);
    });

    it('can create a directory', async () => {
        const client: WebHDFSClient = ClientFactory.Create({
            Host: 'localhost',
            Port: 50070,
            Path: 'webhdfs/v1/testing/',
            User: 'root'
        });

        const path = 'integration/';

        let outcome = await client.MakeDirectory(path);
        expect(outcome.Success).toBe(true);
    });

    it('can roundtrip a file.', async (done) => {
        const hdfsPath = 'integration/roundtrip.txt';
        const client: WebHDFSClient = ClientFactory.Create({
            Host: 'localhost',
            Port: 50070,
            Path: 'webhdfs/v1/testing/',
            User: 'root'
        });

        const expected: string = 'this is my test string that I am round-tripping.\n have a good trip!';
        let inputStream = new sb.ReadableStreamBuffer();
        inputStream.put(expected);
        inputStream.stop();

        let outcome = await client.CreateFile(inputStream, hdfsPath, { Overwrite: true });
        expect(outcome.Success).toBe(true);

        let outStream = new sb.WritableStreamBuffer();
        client.OpenFile(hdfsPath)
            .on('complete', assert)
            .pipe(outStream);

        function assert(): void {
            outStream.end();
            let actual = outStream.getContentsAsString();

            expect(actual).toEqual(expected);
            done();
        }
    });
});
