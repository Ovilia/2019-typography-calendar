import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController, ToastController, Platform } from 'ionic-angular';
import { TapticEngine } from '@ionic-native/taptic-engine';
import { Subscription } from 'rxjs/Subscription';
import * as zrender from 'zrender';
import * as moment from 'moment';

import { StorageService } from '../../services/storage';
import { HistoryService } from '../../services/history';
import { LogService } from '../../services/log';
import { STORE_KEY, DPR, IS_DEBUG, IMAGE_DPR } from '../../utils/constants';
import { getDate } from '../../utils/time';
import CalendarCanvas from '../../entities/calendarCanvas';
import MonthlyCalendarChart from '../../entities/monthlyCalendarChart';

const PAGE_NAME = 'history';

@Component({
    selector: 'page-history',
    templateUrl: 'history.html',
})
export class HistoryPage {

    @ViewChild('historyCanvas') historyCanvasEl: ElementRef;
    @ViewChild('monthlyCalendar') monthlyCalendarEl: ElementRef;
    protected canvas: HTMLCanvasElement;
    protected ctx: CanvasRenderingContext2D;
    protected zr: any;

    public isEmpty: boolean;
    public tearDay: moment.Moment;
    public viewDay: moment.Moment;
    public fromDay: moment.Moment;
    public monthlyCalendar: MonthlyCalendarChart;
    public isMonthlyOpen: boolean;

    protected height: number;
    protected imgRenderWidth: number;
    protected imgRenderHeight: number;
    protected isTouchMoved: boolean;
    protected shakeWatch: Subscription;
    protected historyPages: any[];

    constructor(
        public navCtrl: NavController,
        public viewCtrl: ViewController,
        public toastCtrl: ToastController,
        public navParams: NavParams,
        public storage: StorageService,
        public historyService: HistoryService,
        public logService: LogService,
        public platform: Platform,
        public taptic: TapticEngine
    ) {
        this.isEmpty = true;
        this.isTouchMoved = false;
        this.imgRenderWidth = 0;
        this.imgRenderHeight = 0;
        this.historyPages = [];
        this.tearDay = moment();
        this.viewDay = moment();
        this.fromDay = moment();
        this.isMonthlyOpen = false;
    }

    async ionViewDidLoad() {
        this.logService.logPageView(PAGE_NAME);

        this.canvas = this.historyCanvasEl.nativeElement;
        this.height = this.canvas.clientHeight;
        this.canvas.width = this.canvas.clientWidth * DPR;
        this.canvas.height = this.height * DPR;
        this.ctx = this.canvas.getContext('2d');

        this.zr = zrender.init(this.canvas);

        await this._init();
    }

    get title() {
        if (this.isEmpty) {
            return '';
        }
        else if (this.isMonthlyOpen) {
            if (this.monthlyCalendar) {
                return '2019/' + (this.monthlyCalendar.viewMonth + 1);
            }
            else {
                return this.viewDay.format('YYYY/MM');
            }
        }
        else {
            return this.viewDay.format('M 月 DD 日');
        }
    }

    dismiss(): void {
        this.viewCtrl.dismiss();
    }

    async _init() {
        this.tearDay = getDate(await this.storage.get(STORE_KEY.TORN_DATE));
        this.isEmpty = !this.tearDay || !this.tearDay.isValid() || this.tearDay.year() === 2018;
        if (!this.isEmpty) {
            this.updateViewDay(this.tearDay);
        }

        await this._render();
    }

    toggleCalendar() {
        if (!this.isMonthlyOpen) {
            // Open
            setTimeout(() => {
                this.monthlyCalendar = new MonthlyCalendarChart(
                    this.monthlyCalendarEl.nativeElement, this.tearDay, this.viewDay.month(), this);
            });
        }
        this.isMonthlyOpen = !this.isMonthlyOpen;
    }

    closeCalendar() {
        this.isMonthlyOpen = false;
    }

    onDaySelect(dateStr) {
        this.closeCalendar();
        this.updateViewDay(getDate(dateStr));
        this._render();
    }

    protected updateViewDay(viewDay) {
        this.viewDay = viewDay.clone();
        const span = this.getDaySpan(viewDay);
        this.fromDay = this.viewDay.clone().subtract(span, 'day');
    }

    protected getDaySpan(viewDay) {
        return Math.min(7, viewDay.diff(moment('2018-12-30'), 'day'));
    }

    protected async _render() {
        if (this.isEmpty) {
            return;
        }

        this.historyPages = [];
        this.zr.clear();

        const imgScale = 0.8;
        const cw = this.canvas.width;
        const ch = this.canvas.height;

        let touchTarget = null;
        let lastX;
        let lastY;
        const days = Math.min(7, this.viewDay.diff(moment('2018-12-30'), 'day'));
        let date = this.viewDay.clone();
        let z = days;

        const canvas = document.createElement('canvas');
        canvas.width = cw * imgScale;
        canvas.height = ch * imgScale;
        const calendar = new CalendarCanvas(date, canvas, true);

        for (let i = 0; i < days; ++i) {
            calendar.setDate(date, true);

            await new Promise(async (resolve, reject) => {
                const img = new Image();
                let zrImg;

                img.onload = () => {
                    const targetWidth = img.width;
                    const targetHeight = img.height;
                    this.imgRenderWidth = targetWidth;
                    this.imgRenderHeight = targetHeight;

                    const dx = (cw - targetWidth) / 2;
                    const dy = (ch - targetHeight) / 2 - 20;
                    const rotate = i ? (Math.random() * 2 - 1) * 15 / 180 * Math.PI : 0;

                    zrImg = new zrender.Image({
                        style: {
                            image: img,
                            x: dx,
                            y: dy,
                            width: targetWidth,
                            height: targetHeight,
                            shadowBlur: 20,
                            shadowColor: 'rgba(0, 0, 0, 0.15)',
                            shadowOffsetX: 2,
                            shadowOffsetY: 2
                        },
                        rotation: rotate,
                        origin: [targetWidth / 2, targetHeight / 2],
                        z: --z
                    });
                    this.historyPages.push(zrImg);

                    // zrImg.on('mousedown', function (e) {
                    //     touchTarget = e.target;
                    //     touchTarget.attr('z', ++z);
                    //     lastX = e.offsetX;
                    //     lastY = e.offsetY;
                    // });

                    // zrImg.on('mousemove', e => {
                    //     if (!touchTarget) {
                    //         return;
                    //     }

                    //     if (!this.isTouchMoved) {
                    //         this.logService.logEvent(PAGE_NAME, 'interacted');
                    //         this.isTouchMoved = true;
                    //     }

                    //     const oldStyle = touchTarget.style;
                    //     const newX = oldStyle.x + (e.offsetX - lastX);
                    //     const newY = oldStyle.y + (e.offsetY - lastY);
                    //     touchTarget.attr({
                    //         style: {
                    //             x: newX,
                    //             y: newY
                    //         }
                    //     });
                    //     lastX = e.offsetX;
                    //     lastY = e.offsetY;
                    // });

                    // zrImg.on('mouseup', function (e) {
                    //     touchTarget = null;
                    //     lastX = null;
                    //     lastY = null;
                    // });

                    this.zr.add(zrImg);
                    resolve();
                };
                img.onerror = reject;
                img.src = await calendar.getRenderedBase64();
            });

            date = date.subtract(1, 'day');
        }

        z = days;
    }

    protected async _getImageSize(src) {
        return await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    width: img.width / DPR,
                    height: img.height / DPR
                });
            };
            img.onerror = reject;
            img.src = src;
        });
    }

}
