import { Injectable } from '@angular/core';
import { StorageService } from './storage';
import { STORE_KEY } from '../utils/constants';

@Injectable()
export class HistoryService {
    constructor(public storage: StorageService) {

    }

    async getTornDate(): Promise<Date> {
        return await this.storage.get(STORE_KEY.TORN_DATE);
    }

    async setTornDate(date: Date): Promise<void> {
        return await this.storage.set(STORE_KEY.TORN_DATE, date);
    }
}
