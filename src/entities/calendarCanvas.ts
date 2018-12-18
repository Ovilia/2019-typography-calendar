import * as moment from 'moment';
import {DPR, DESIGN_WIDTH} from '../utils/constants';
import { getThemeColor } from '../utils/colors';

export default class CalendarCanvas {

    protected ctx: CanvasRenderingContext2D;

    constructor(public dateMoment: moment.Moment, public canvas: HTMLCanvasElement) {
        canvas.width = canvas.clientWidth * DPR;
        canvas.height = canvas.clientHeight * DPR;

        this.ctx = canvas.getContext('2d');
        this._render();
    }

    setDate(dateMoment: moment.Moment) {
        this.dateMoment = dateMoment;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this._render();
    }

    protected _render() {
        const dateMoment = this.dateMoment;
        const padding = 20;
        const dayOfYear = dateMoment.dayOfYear();
        const date = dateMoment.format('M.D');

        this.ctx.fillStyle = this._getBackground();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this._renderImage(`../assets/imgs/fonts/ui/dark/lunar/${dayOfYear}.png`, padding, padding);
        this._renderImage(`../assets/imgs/fonts/ui/dark/month/${dateMoment.month()}.png`, padding, 48);
        this._renderImage(`../assets/imgs/fonts/ui/dark/dayOfWeek/${dateMoment.day()}.png`, padding, 80);
        this._renderImage(`../assets/imgs/fonts/story/dark/${date}.png`, padding, null, null, padding);
        this._renderImage(`../assets/imgs/fonts/date/dark/${date}.png`, null, 40, this._isWideDigit() ? -20 : padding);
        this._renderImage(`../assets/imgs/fonts/fontName/dark/${date}.png`, null, 275, padding);
    }

    protected _renderImage(path: string, left?: number, top?: number, right?: number, bottom?: number) {
        const img = new Image();

        img.onload = () => {
            const width = this._px(img.width / DPR);
            const height = this._px(img.height / DPR);
            let x = this._px(left);
            let y = this._px(top);
            if (left == null) {
                x = this.canvas.width - width - this._px(right);
            }
            if (top == null) {
                y = this.canvas.height - height - this._px(bottom);
            }
            this.ctx.drawImage(img, x, y, width, height);
        };

        img.src = path;
    }

    protected _px(designPx: number): number {
        return designPx / DESIGN_WIDTH * this.canvas.width;
    }

    protected _getBackground(): string {
        return getThemeColor(this.dateMoment.format('M.D'));
    }

    protected _isWideDigit(): boolean {
        const n = this.dateMoment.day();
        return n > 9 || this.dateMoment.format('D') !== '1';
    }
}
