import * as moment from 'moment';
import {DPR, DESIGN_WIDTH} from '../utils/constants';
import { getThemeColor, mainColor } from '../utils/colors';
import { getDate } from '../utils/time';
import { DayInfoService } from '../services/dayInfo';

export default class CalendarCanvas {

    protected ctx: CanvasRenderingContext2D;

    private images: Object;

    constructor(public dateMoment: moment.Moment, public canvas: HTMLCanvasElement, public dayInfo: DayInfoService) {
        this.images = {};

        if (canvas.clientWidth) {
            canvas.width = canvas.clientWidth * DPR;
        }
        if (canvas.clientHeight) {
            canvas.height = canvas.clientHeight * DPR;
        }

        this.ctx = canvas.getContext('2d');
        this._render();
    }

    setDate(dateMoment: moment.Moment) {
        this.dateMoment = dateMoment;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this._render();
    }

    async getRenderedBase64() {
        await this._render();
        return this.canvas.toDataURL();
    }

    protected async _render() {
        if (this.dateMoment.isBefore(getDate('2019-01-01'))) {
            await this._renderFrontPage();
        }
        else {
            await this._renderInnerPage();
        }
    }

    protected async _renderFrontPage() {
        this.ctx.fillStyle = mainColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        let img = await this._getImage('../assets/imgs/front-page.png');
        const left = (this.canvas.width - img.width) / 2;
        const top = (this.canvas.height - img.height) / 2;
        this.ctx.drawImage(img, left, top);
    }

    protected async _renderInnerPage() {
        const dateMoment = this.dateMoment;
        const padding = 20;
        const dayOfYear = dateMoment.dayOfYear();
        const date = dateMoment.format('M.D');

        this.ctx.fillStyle = this._getBackground();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        await this._renderImage(`../assets/imgs/fonts/ui/dark/lunar/${dayOfYear}.png`, padding, padding);
        await this._renderImage(`../assets/imgs/fonts/ui/dark/month/${dateMoment.month()}.png`, padding, 48);
        await this._renderImage(`../assets/imgs/fonts/ui/dark/dayOfWeek/${dateMoment.day()}.png`, padding, 80);
        await this._renderImage(`../assets/imgs/fonts/fontName/dark/${date}.png`, null, 275, padding);
        await this._renderStory(date, padding);
        await this._renderImage(
            `../assets/imgs/fonts/date/dark/${date}.png`,
            null,
            null,
            null,
            null,
            img => {
                const targetWidth = 258;
                const targetHeight = 225;
                const result = {
                    width: 0,
                    height: 0,
                    right: null,
                    top: null
                };

                if (img.width / img.height > targetWidth / targetHeight) {
                    result.width = this._px(targetWidth);
                    result.height = result.width / img.width * img.height;
                }
                else {
                    result.height = this._px(targetHeight);
                    result.width = result.height / img.height * img.width;
                }

                if (result.width < this._px(180)) {
                    result.right = this._px(padding) / 2;
                }
                else if (result.width > this._px(260)) {
                    result.right = -this._px(padding);
                }
                else {
                    result.right = -this._px(padding) / 2;
                }

                result.top = this._px(130) - result.height / DPR;
                return result;
            }
        );
    }

    protected async _renderStory(date: string, padding: number) {
        const storyPath = `../assets/imgs/fonts/story/dark/${date}.png`;
        const notePath = `../assets/imgs/fonts/note/dark/${date}.png`;
        const dayInfo = this.dayInfo.getDayInfo(date);
        if (dayInfo && dayInfo.note) {
            this.ctx.globalAlpha = 0.6;
            await this._renderImage(notePath, padding, null, null, padding);
            this.ctx.globalAlpha = 1;

            const noteImg = await this._getImage(notePath);
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
        targetSizeFormatter?: Function
    ) {
        const img = await this._getImage(path);
        let width;
        let height;
        if (targetSizeFormatter) {
            const size = targetSizeFormatter(img);
            if (size) {
                width = size.width;
                height = size.height;
                right = size.right == null ? right : size.right;
                top = size.top == null ? top : size.top;
            }
        }
        else {
            width = this._px(img.width / DPR);
            height = this._px(img.height / DPR);
        }

        let x = this._px(left);
        let y = this._px(top);
        if (left == null) {
            x = this.canvas.width - width - this._px(right);
        }
        if (top == null) {
            y = this.canvas.height - height - this._px(bottom);
        }
        this.ctx.drawImage(img, x, y, width, height);
    }

    protected async _getImage(path) {
        if (this.images[path]) {
            return this.images[path];
        }

        return await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images[path] = img;
                resolve(img);
            };
            img.onerror = reject;
            img.src = path;
        });
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
