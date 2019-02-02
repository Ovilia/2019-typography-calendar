import * as moment from 'moment';

import infoStr from '../data/dayInfo';

export function getDate(date: string | moment.Moment | Date): moment.Moment {
    if (typeof date === 'string') {
        return moment(date);
    }
    else if (typeof date === 'object' && date instanceof Date) {
        return getDate(moment(date));
    }
    else {
        return moment(date.format('YYYY-MM-DD'));
    }
}

export function getDayInfo(dateStr: string) {
    const infoStrArr = (infoStr as any).split('\n')
            .filter(line => line && line.indexOf('#') !== 0);

    for (let i = 0; i < infoStrArr.length; ++i) {
        const parts = infoStrArr[i].split('|');
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
