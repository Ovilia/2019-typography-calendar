import * as moment from 'moment';
import {DPR, DESIGN_WIDTH, IMAGE_DPR, LAST_AVAILABLE_DATE} from '../utils/constants';
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

    setDate(dateMoment: moment.Moment, lazyRender?: boolean) {
        this.dateMoment = dateMoment;
        this.isFrontPage = dateMoment.isBefore(getDate('2019-01-01'), 'day');

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!lazyRender) {
            this.render();
        }
    }

    async getRenderedBase64() {
        await this.render();
        return this.canvas.toDataURL();
    }

    async render() {
        if (this.dateMoment.isAfter(getDate(LAST_AVAILABLE_DATE))) {
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
        const paddingV = 25;
        const dayOfYear = dateMoment.dayOfYear();
        const date = dateMoment.format('M.D');

        await this._renderBg(date);

        switch (date) {
            case '2.5':
                await this._renderImage('assets/imgs/fonts/ui/dark/lunar/2.5.png', padding, paddingV);
                await this._renderImage('assets/imgs/fonts/ui/dark/month/2.5.png', padding, 50);
                await this._renderImage('assets/imgs/fonts/ui/dark/dayOfWeek/2.5.png', padding, 83);
                break;

            default:
                await this._renderImage(`assets/imgs/fonts/ui/dark/lunar/${dayOfYear}.png`, padding, paddingV);
                await this._renderImage(`assets/imgs/fonts/ui/dark/month/${dateMoment.month()}.png`, padding, 50);
                await this._renderImage(`assets/imgs/fonts/ui/dark/dayOfWeek/${dateMoment.day()}.png`, padding, 83);
        }
        await this._renderFont(date, padding, paddingV);
        await this._renderStory(date, padding, paddingV);
    }

    protected async _renderBg(date: string) {
        switch (date) {
            case '2.5':
                const path = 'assets/imgs/red-paper.png';
                const img = await getImage(path);
                const imgWidth = img.width / IMAGE_DPR;
                const imgHeight = img.height / IMAGE_DPR;
                const xCnt = Math.floor(this.canvas.width / imgWidth) + 1;
                const yCnt = Math.floor(this.canvas.height / imgHeight) + 1;
                for (let i = 0; i < xCnt; ++i) {
                    for (let j = 0; j < yCnt; ++j) {
                        await this._renderImage(path, i * imgWidth, j * imgHeight);
                    }
                }
                break;

            default:
                this.ctx.fillStyle = this._getBackground();
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    protected async _renderFont(date: string, padding: number, paddingTop: number) {
        const datePath = `assets/imgs/fonts/date/dark/${date}.png`;
        const dateImg = await getImage(datePath);

        const getDatePosition = img => {
            const targetWidth = 210;
            let targetHeight = 225;

            switch (date) {
                case '2.5':
                    targetHeight = 350;
                    break;

                case '3.31':
                    targetHeight = 200;
                    break;
            }

            const result = {
                width: 0,
                height: 0,
                right: padding
            };

            if (img.width / img.height > targetWidth / targetHeight) {
                result.width = targetWidth;
                result.height = result.width / img.width * img.height;
            }
            else {
                result.height = targetHeight;
                result.width = result.height / img.height * img.width;
            }

            return result;
        };
        const datePos = getDatePosition(dateImg);
        await this._renderImage(datePath, null, paddingTop, datePos.right, null, datePos.width, datePos.height);

        const nameTop = datePos.height + paddingTop * 1.5;
        await this._renderImage(`assets/imgs/fonts/fontName/dark/${date}.png`, null, nameTop, padding);
    }

    protected async _renderStory(date: string, padding: number, paddingV: number) {
        const storyPath = `assets/imgs/fonts/story/dark/${date}.png`;
        const notePath = `assets/imgs/fonts/note/dark/${date}.png`;
        const dayInfo = getDayInfo(date);
        if (dayInfo && dayInfo.note) {
            await this._renderImage(notePath, padding, null, null, paddingV);

            const noteImg = await getImage(notePath);
            const storyBottom = paddingV + noteImg.height / IMAGE_DPR + 10;
            await this._renderImage(storyPath, padding, null, null, storyBottom);
        }
        else {
            await this._renderImage(storyPath, padding, null, null, paddingV);
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
        let w = width == null ? this._px(img.width / IMAGE_DPR) : this._px(width);
        let h = height == null ? this._px(img.height / IMAGE_DPR) : this._px(height);

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
