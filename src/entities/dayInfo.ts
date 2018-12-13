import * as moment from 'moment';
import * as chineseLunar from 'chinese-lunar';

import random from '../utils/random';

import { neural } from '../scripts/advice';
import fontInfo from '../scripts/fontInfo';


export default class DayInfo {

    month: string;
    date: string;
    dayOfWeek: string;
    lunarDate: string;

    dateMoment: moment.Moment;

    story: string;
    adviceToDo: string;
    adviceNotToDo: string;

    constructor(dateStr?: string) {
        console.log(dateStr);
        this.dateMoment = moment(dateStr);

        this.month = this.dateMoment.format('MMMM');
        this.date = this.dateMoment.format('D');
        this.dayOfWeek = this.dateMoment.format('dddd');

        const lunar = chineseLunar.solarToLunar(this.dateMoment.toDate());
        this.lunarDate = chineseLunar.format(lunar, 'Md');

        const fontInfo = this._getFontInfo(this.dateMoment);

        const dayOfYear = this.dateMoment.dayOfYear();

        this.story = fontInfo.fontStory;
        // TODO: tmp
        if (!this.story) {
            this.story = '这里是一句话的字体故事，它可能是关于字体的一个有趣的故事。';
        }

        this.adviceToDo = random(neural);
        this.adviceNotToDo = random(neural);
        while (this.adviceNotToDo === this.adviceToDo) {
            this.adviceNotToDo = random(neural);
        }
    }

    protected _getFontInfo(dateMoment: moment.Moment): FontInfo {
        const result = fontInfo.find(line => {
            if (line && line.date === dateMoment.format('M.D')) {
                return true;
            }
        });
        if (result) {
            return {
                fontFamily: result.fontFamily,
                fontStory: result.fontStory
            };
        }
        else {
            throw new Error('_getFontInfo: date not found ' + dateMoment.format('M.D'));
        }
    }

    // protected _getAdviceToDo(dayOfYear): string {
    //     const advices = adviceToDo.split('\n');
    //     // TODO: reuse some advice
    //     return advices[dayOfYear] || '';
    // }

    // protected _getAdviceNotToDo(dayOfYear): string {
    //     const advices = adviceNotToDo.split('\n');
    //     // TODO: reuse some advice
    //     return advices[dayOfYear] || '';
    // }
}

interface FontInfo {
    fontFamily: string,
    fontStory: string
};
