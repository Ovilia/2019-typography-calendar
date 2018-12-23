import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage';
import { Storage as LocalStorage } from '@ionic/storage';

@Injectable()
export class StorageService {
    protected nativeStorage: NativeStorage;
    protected localStorage: LocalStorage;

    constructor() {
        this.nativeStorage = new NativeStorage();
        this.localStorage = new LocalStorage({});
    }

    async set(key: string, value: any) {
        try {
            return await this.nativeStorage.setItem(key, value);
        }
        catch (err) {
            console.warn(err);
            console.warn('Native storage not available, using local storage instead');
            return await this.localStorage.set(key, value);
        }
    }

    async get(key: string) {
        try {
            const value = await this.nativeStorage.getItem(key);
            return value;
        }
        catch (err) {
            console.warn(err);
            if (typeof err === 'string' && err.indexOf('cordova_not_available') > -1) {
                console.warn('Native storage not available, using local storage instead');
                return await this.localStorage.get(key);
            }
            else if (typeof err === 'object' && err.code === 2) {
                // Item not found
                return null;
            }
            else {
                throw err;
            }
        }
    }
}
