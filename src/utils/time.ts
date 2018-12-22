import * as moment from 'moment';

export function getDate(date: string | moment.Moment | Date) {
    if (typeof date === 'string') {
        return moment(date + 'T00:00:00+08:00');
    }
    else if (typeof date === 'object' && date instanceof Date) {
        return getDate(moment(date));
    }
    else {
        return moment(date.format('YYYY-MM-DD') + 'T00:00:00+08:00');
    }
}
