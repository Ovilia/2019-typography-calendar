import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { StorageService } from './storage';
import { STORE_KEY } from '../utils/constants';
import CalendarCanvas from '../entities/calendarCanvas';

@Injectable()
export class HistoryService {
    constructor(public storage: StorageService) {

    }

    async getTornDate(): Promise<Date> {
        return await this.storage.get(STORE_KEY.TORN_DATE);
    }

    async setTornDate(dateMoment: moment.Moment, width: number, height: number): Promise<void> {
        const lastTear = await this.getTornDate();
        if (!lastTear) {
            await this.storage.set(STORE_KEY.FIRST_TEAR, 'torn');
        }

        console.log(dateMoment.toDate())
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const calendar = new CalendarCanvas(dateMoment, canvas);

        const base64 = await calendar.getRenderedBase64();
        const historyPages = await this.storage.get(STORE_KEY.HISTORY_PAGE) || [];
        const newPage = {
            date: Date,
            image: base64
        };
        historyPages.push(newPage);

        await this.storage.set(STORE_KEY.HISTORY_PAGE, historyPages);
        return await this.storage.set(STORE_KEY.TORN_DATE, dateMoment.toDate());
    }

    async isFirstOpen(): Promise<boolean> {
        return await this.storage.get(STORE_KEY.FIRST_OPEN) == null;
    }

    async setFirstOpened(): Promise<void> {
        await this.storage.set(STORE_KEY.FIRST_OPEN, 'opened');
    }

    async isFirstTear(): Promise<boolean> {
        return await this.storage.get(STORE_KEY.FIRST_TEAR) == null;
    }
}
