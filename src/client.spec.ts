import { Client } from './client';

describe('Client', () => {
    it('can be constructed', () => {
        let sut = new Client();
        expect(sut).toBeDefined();
    });
});