import { Injectable } from '@angular/core';
import infoStr from '../data/dayInfo';

@Injectable()
export class DayInfoService {

    private infoStrArr;

    constructor() {
        this.infoStrArr = (infoStr as any).split('\n')
            .filter(line => line && line.indexOf('#') < 0);
    }

    getDayInfo(dateStr: string) {
        for (let i = 0; i < this.infoStrArr.length; ++i) {
            const parts = this.infoStrArr[i].split('|');
            const partDate = parts[0].trim();
            if (partDate === dateStr) {
                return {
                    date: dateStr,
                    name: parts[1].trim(),
                    font: parts[2].trim(),
                    story: parts[3].trim(),
                    note: parts[4].trim()
                };
            }
        }
    }

}
