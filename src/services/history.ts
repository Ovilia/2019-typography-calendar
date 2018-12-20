import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { StorageService } from './storage';
import { STORE_KEY } from '../utils/constants';
import CalendarCanvas from '../entities/calendarCanvas';
import { getDate } from '../utils/time';

@Injectable()
export class HistoryService {
    constructor(public storage: StorageService) {

    }

    async getTearDate(): Promise<Date> {
        return await this.storage.get(STORE_KEY.TORN_DATE);
    }

    async setTearDate(dateMoment: moment.Moment, width: number, height: number): Promise<void> {
        let lastMoment: moment.Moment;
        const lastTear = await this.getTearDate();
        if (!lastTear) {
            await this.storage.set(STORE_KEY.FIRST_TEAR, 'torn');
            lastMoment = moment('2018-12-31');
        }
        else {
            lastMoment = moment(lastTear);
        }

        dateMoment = getDate(dateMoment);
        lastMoment = getDate(lastMoment);

        while (lastMoment.isBefore(dateMoment)) {
            lastMoment = lastMoment.add(1, 'day');
            await this.tearNextDay(lastMoment, width, height);
        }
    }

    async tearNextDay(nextDay: moment.Moment, width: number, height: number): Promise<void> {
        const lastTear = await this.getTearDate();
        if (!lastTear) {
            await this.storage.set(STORE_KEY.FIRST_TEAR, 'torn');
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const calendar = new CalendarCanvas(nextDay, canvas);

        const base64 = await calendar.getRenderedBase64();
        const historyPages = await this.storage.get(STORE_KEY.HISTORY_PAGE) || [];
        const newPage = {
            date: Date,
            image: base64
        };
        historyPages.push(newPage);

        await this.storage.set(STORE_KEY.HISTORY_PAGE, historyPages);
        return await this.storage.set(STORE_KEY.TORN_DATE, nextDay.toDate());
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
