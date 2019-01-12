import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class StorageService {
    protected storage: Storage;

    constructor() {
        this.storage = new Storage({});
    }

    async set(key: string, value: any) {
        try {
            return await this.storage.set(key, value);
        }
        catch (err) {
            throw err;
        }
    }

    async get(key: string) {
        try {
            const value = await this.storage.get(key);
            return value;
        }
        catch (err) {
            if (typeof err === 'object' && err.code === 2) {
                // Item not found
                return null;
            }
            else {
                throw err;
            }
        }
    }
}
