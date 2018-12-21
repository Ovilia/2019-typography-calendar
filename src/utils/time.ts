import * as moment from 'moment';

export function getDate(time: moment.Moment) {
    return time.hour(0).minute(0).second(0);
}
