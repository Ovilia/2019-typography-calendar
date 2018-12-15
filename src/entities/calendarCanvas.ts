import * as moment from 'moment';
import {DPR, DESIGN_WIDTH} from '../utils/constants';

export default class CalendarCanvas {

    protected ctx: CanvasRenderingContext2D;
    protected scale: number;

    constructor(public dateMoment: moment.Moment, public canvas: HTMLCanvasElement) {
        canvas.width = canvas.clientWidth * DPR;
        canvas.height = canvas.clientHeight * DPR;

        this.ctx = canvas.getContext('2d');

        this.scale = canvas.width / DESIGN_WIDTH / DPR;
        const padding = 24;
        const dayOfYear = dateMoment.dayOfYear();
        const date = dateMoment.format('M.D');

        this.ctx.fillStyle = this._getBackground();
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);

        this._renderImage(`../assets/imgs/fonts/ui/dark/lunar/${dayOfYear}.png`, padding, padding);
        this._renderImage(`../assets/imgs/fonts/ui/dark/month/${dateMoment.month()}.png`, padding, 48);
        this._renderImage(`../assets/imgs/fonts/ui/dark/dayOfWeek/${dateMoment.day()}.png`, padding, 80);
        this._renderImage(`../assets/imgs/fonts/story/dark/${date}.png`, padding, null, null, padding);
        this._renderImage(`../assets/imgs/fonts/date/dark/${date}.png`, null, 40, this._isWideDigit() ? -10 : padding);
        this._renderImage(`../assets/imgs/fonts/fontName/dark/${date}.png`, null, 280, padding);
    }

    protected _renderImage(path: string, left?: number, top?: number, right?: number, bottom?: number) {
        const img = new Image();

        img.onload = () => {
            let x = left * DPR;
            let y = top * DPR;
            if (left == null) {
                x = this.canvas.width - img.width - right * DPR;
            }
            if (top == null) {
                y = this.canvas.height - img.height - bottom * DPR;
            }
            this.ctx.drawImage(img, x, y, img.width * this.scale, img.height * this.scale);
        };

        img.src = path;
    }

    protected _getBackground(): string {
        // TODO:
        return '#FFE268';
    }

    protected _isWideDigit(): boolean {
        const n = this.dateMoment.day();
        return n > 9 || this.dateMoment.format('D') !== '1';
    }
}
