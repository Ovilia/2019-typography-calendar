import * as moment from 'moment';
import * as chineseLunar from 'chinese-lunar';

import daySentence from '../scripts/daySentence';
import adviceToDo from '../scripts/adviceToDo';
import adviceNotToDo from '../scripts/adviceNotToDo';

export default class DayInfo {

    month: string;
    date: string;
    dayOfWeek: string;
    lunarDate: string;

    dateMoment: moment.Moment;

    sentence: string;
    adviceToDo: string;
    adviceNotToDo: string;

    constructor(date: Date) {
        this.dateMoment = moment(date);

        this.month = this.dateMoment.format('MMMM');
        this.date = this.dateMoment.format('D');
        this.dayOfWeek = this.dateMoment.format('dddd');

        const lunar = chineseLunar.solarToLunar(date);
        this.lunarDate = chineseLunar.format(lunar, 'Md');

        const dayOfYear = this.dateMoment.dayOfYear();
        this.sentence = this._getSentence(dayOfYear);
        // TODO: tmp
        if (!this.sentence) {
            this.sentence = '这里是一句话的字体故事，它可能是关于字体的一个有趣的故事。';
        }

        this.adviceToDo = this._getAdviceToDo(dayOfYear);
        if (!this.adviceToDo) {
            this.adviceToDo = '交稿';
        }

        this.adviceNotToDo = this._getAdviceNotToDo(dayOfYear);
        if (!this.adviceNotToDo) {
            this.adviceNotToDo = '拖延';
        }
    }

    protected _getSentence(dayOfYear): string {
        const sentences = daySentence.split('\n');
        return sentences[dayOfYear] || '';
    }

    protected _getAdviceToDo(dayOfYear): string {
        const advices = adviceToDo.split('\n');
        // TODO: reuse some advice
        return advices[dayOfYear] || '';
    }

    protected _getAdviceNotToDo(dayOfYear): string {
        const advices = adviceNotToDo.split('\n');
        // TODO: reuse some advice
        return advices[dayOfYear] || '';
    }
}