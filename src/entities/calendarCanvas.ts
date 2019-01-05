import * as moment from 'moment';
import {DPR, DESIGN_WIDTH} from '../utils/constants';
import { getThemeColor, mainColor } from '../utils/colors';
import { getDate, getDayInfo } from '../utils/time';
import { getImage } from '../utils/image';

export default class CalendarCanvas {

    public isFrontPage: boolean;

    protected ctx: CanvasRenderingContext2D;

    constructor(public dateMoment: moment.Moment, public canvas: HTMLCanvasElement, lazyRender?: boolean) {
        this.dateMoment = dateMoment.clone();

        if (canvas.clientWidth) {
            canvas.width = canvas.clientWidth * DPR;
        }
        if (canvas.clientHeight) {
            canvas.height = canvas.clientHeight * DPR;
        }

        this.isFrontPage = dateMoment.isBefore(getDate('2019-01-01'), 'day');

        this.ctx = canvas.getContext('2d');

        if (!lazyRender) {
            this.render();
        }
    }

    setDate(dateMoment: moment.Moment) {
        this.dateMoment = dateMoment;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.render();
    }

    async getRenderedBase64() {
        await this.render();
        return this.canvas.toDataURL();
    }

    async render() {
        if (this.dateMoment.isAfter(getDate('2019-01-31'))) {
            return;
        }
        if (this.isFrontPage) {
            await this._renderFrontPage();
        }
        else {
            await this._renderInnerPage();
        }
    }

    protected async _renderFrontPage() {
        this.ctx.fillStyle = mainColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        let img = await getImage('assets/imgs/front-page.png');
        const targetHeight = this.canvas.height < this._px(550) ? this.canvas.height * 0.85 : img.height;
        const targetWidth = targetHeight / img.height * img.width;
        const left = (this.canvas.width - targetWidth) / 2;
        const top = (this.canvas.height - targetHeight) / 2;
        this.ctx.drawImage(img, left, top, targetWidth, targetHeight);
    }

    protected async _renderInnerPage() {
        const dateMoment = this.dateMoment;
        const padding = 20;
        const paddingTop = 30;
        const dayOfYear = dateMoment.dayOfYear();
        const date = dateMoment.format('M.D');

        this.ctx.fillStyle = this._getBackground();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        await this._renderImage(`assets/imgs/fonts/ui/dark/lunar/${dayOfYear}.png`, padding, paddingTop);
        await this._renderImage(`assets/imgs/fonts/ui/dark/month/${dateMoment.month()}.png`, padding, 53);
        await this._renderImage(`assets/imgs/fonts/ui/dark/dayOfWeek/${dateMoment.day()}.png`, padding, 86);
        await this._renderFont(date, padding, paddingTop);
        await this._renderStory(date, padding);
    }

    protected async _renderFont(date: string, padding: number, paddingTop: number) {
        const datePath = `assets/imgs/fonts/date/dark/${date}.png`;
        const dateImg = await getImage(datePath);

        const getDatePosition = img => {
            const targetWidth = 258;
            const targetHeight = 225;
            const result = {
                width: 0,
                height: 0,
                right: null
            };

            if (img.width / img.height > targetWidth / targetHeight) {
                result.width = targetWidth;
                result.height = result.width / img.width * img.height;
            }
            else {
                result.height = targetHeight;
                result.width = result.height / img.height * img.width;
            }

            if (result.width < 180) {
                result.right = padding;
            }
            else if (result.width > 260) {
                result.right = -padding * 2;
            }
            else {
                result.right = -padding;
            }
            return result;
        };
        const datePos = getDatePosition(dateImg);
        await this._renderImage(datePath, null, paddingTop, datePos.right, null, datePos.width, datePos.height);

        const nameTop = datePos.height + paddingTop * 1.5;
        await this._renderImage(`assets/imgs/fonts/fontName/dark/${date}.png`, null, nameTop, padding);
    }

    protected async _renderStory(date: string, padding: number) {
        const storyPath = `assets/imgs/fonts/story/dark/${date}.png`;
        const notePath = `assets/imgs/fonts/note/dark/${date}.png`;
        const dayInfo = getDayInfo(date);
        if (dayInfo && dayInfo.note) {
            await this._renderImage(notePath, padding, null, null, padding);

            const noteImg = await getImage(notePath);
            const storyBottom = padding + noteImg.height / DPR + 10;
            await this._renderImage(storyPath, padding, null, null, storyBottom);
        }
        else {
            await this._renderImage(storyPath, padding, null, null, padding);
        }
    }

    protected async _renderImage(
        path: string,
        left?: number,
        top?: number,
        right?: number,
        bottom?: number,
        width?: number,
        height?: number
    ) {
        const img = await getImage(path);
        let w = width == null ? this._px(img.width / DPR) : this._px(width);
        let h = height == null ? this._px(img.height / DPR) : this._px(height);

        let x = this._px(left);
        let y = this._px(top);
        if (left == null) {
            x = this.canvas.width - w - this._px(right);
        }
        if (top == null) {
            y = this.canvas.height - h - this._px(bottom);
        }
        this.ctx.drawImage(img, x, y, w, h);
    }

    protected _px(designPx: number): number {
        return designPx / DESIGN_WIDTH * this.canvas.width;
    }

    protected _getBackground(): string {
        return getThemeColor(this.dateMoment);
    }

    protected _isWideDigit(): boolean {
        const n = this.dateMoment.day();
        return n > 9 || this.dateMoment.format('D') !== '1';
    }
}
