jest.disableAutomock();

import * as sb from 'stream-buffers';
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

    it('can make a directory', async () => {
        const hdfsDir = 'integration/mkdir/';
        const client: WebHDFSClient = ClientFactory.Create({
            Host: 'localhost',
            Port: 50070,
            Path: 'webhdfs/v1/testing/',
            User: 'root'
        });

        let outcome = await client.MakeDirectory(hdfsDir);

        expect(outcome.Success).toBe(true);
    });

    describe('Delete functionality', () => {
        beforeAll(async () => {
            const hdfsDir = 'integration/delete/';
            const client: WebHDFSClient = ClientFactory.Create({
                Host: 'localhost',
                Port: 50070,
                Path: 'webhdfs/v1/testing/',
                User: 'root'
            });
            let dirExists = await client.Exists(hdfsDir);
            if (dirExists.Success) {
                let outcome = await client.Delete(hdfsDir, true);
                expect(outcome.Success).toBe(true);
            }
        });

        it('can delete an empty directory', async () => {
            const hdfsDir = 'integration/delete/deldir/';
            const client: WebHDFSClient = ClientFactory.Create({
                Host: 'localhost',
                Port: 50070,
                Path: 'webhdfs/v1/testing/',
                User: 'root'
            });

            let setup = await client.MakeDirectory(hdfsDir);
            expect(setup.Success).toBe(true);

            let outcome = await client.Delete(hdfsDir);
            expect(outcome.Success).toBe(true);
        });

        it('cannot delete a directory with children without recursive flag', async () => {
            const hdfsDir = 'integration/delete/deldirNoRecurse/';
            const client: WebHDFSClient = ClientFactory.Create({
                Host: 'localhost',
                Port: 50070,
                Path: 'webhdfs/v1/testing/',
                User: 'root'
            });

            let setup = await client.MakeDirectory(hdfsDir);
            expect(setup.Success).toBe(true);
            const content: string = 'integration test!';
            let inputStream = new sb.ReadableStreamBuffer();
            inputStream.put(content);
            inputStream.stop();
            let child = await client.CreateFile(inputStream, hdfsDir + 'test.txt', { Overwrite: true });
            expect(child.Success).toBe(true);

            let outcome = await client.Delete(hdfsDir);
            expect(outcome.Success).toBe(false);
        });

        it('cannot delete a directory with children if recursive flag is specified', async () => {
            const hdfsDir = 'integration/delete/deldirRecurse/';
            const client: WebHDFSClient = ClientFactory.Create({
                Host: 'localhost',
                Port: 50070,
                Path: 'webhdfs/v1/testing/',
                User: 'root'
            });

            let setup = await client.MakeDirectory(hdfsDir);
            expect(setup.Success).toBe(true);
            const content: string = 'integration test!';
            let inputStream = new sb.ReadableStreamBuffer();
            inputStream.put(content);
            inputStream.stop();
            let child = await client.CreateFile(inputStream, hdfsDir + 'test.txt', { Overwrite: true });
            expect(child.Success).toBe(true);

            let outcome = await client.Delete(hdfsDir, true);
            expect(outcome.Success).toBe(true);
        });
    });
});
