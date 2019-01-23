import * as Color from 'color';
import * as moment from 'moment';

export function getThemeColor(date: moment.Moment): string {
    switch (date.format('M.D')) {
        case '2.5':
            return new Color('#db4c4c');

        default:
            const hue = (date.date() / date.daysInMonth()) * 255;
            return new Color(`hsl(${hue}, 70%, 80%)`).string();
    }
}

export const mainColor = '#FFE06E';
