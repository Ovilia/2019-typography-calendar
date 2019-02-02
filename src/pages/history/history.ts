import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController, ToastController, Platform } from 'ionic-angular';
import { Shake } from '@ionic-native/shake';
import { TapticEngine } from '@ionic-native/taptic-engine';
import { Subscription } from 'rxjs/Subscription';
import * as zrender from 'zrender';
import * as moment from 'moment';

import { StorageService } from '../../services/storage';
import { HistoryService } from '../../services/history';
import { LogService } from '../../services/log';
import { STORE_KEY, DPR, IS_DEBUG } from '../../utils/constants';
import { getDate } from '../../utils/time';
import CalendarCanvas from '../../entities/calendarCanvas';

const PAGE_NAME = 'history';

@Component({
    selector: 'page-history',
    templateUrl: 'history.html',
})
export class HistoryPage {

    @ViewChild('historyCanvas') historyCanvasEl: ElementRef;
    protected canvas: HTMLCanvasElement;
    protected ctx: CanvasRenderingContext2D;
    protected zr: any;

    public isEmpty: boolean;
    public tearDay: moment.Moment;

    protected height: number;
    protected imgRenderWidth: number;
    protected imgRenderHeight: number;
    protected isTouchMoved: boolean;
    protected shakedTimes: number;
    protected shakeWatch: Subscription;

    constructor(
        public navCtrl: NavController,
        public viewCtrl: ViewController,
        public toastCtrl: ToastController,
        public navParams: NavParams,
        public storage: StorageService,
        public historyService: HistoryService,
        public logService: LogService,
        public platform: Platform,
        public taptic: TapticEngine,
        public shake: Shake
    ) {
        this.isEmpty = true;
        this.isTouchMoved = false;
        this.shakedTimes = 0;
        this.imgRenderWidth = 0;
        this.imgRenderHeight = 0;
    }

    async ionViewDidLoad() {
        this.logService.logPageView(PAGE_NAME);

        this.canvas = this.historyCanvasEl.nativeElement;
        this.height = this.canvas.clientHeight + 20;
        this.canvas.width = this.canvas.clientWidth * DPR;
        this.canvas.height = this.height * DPR;
        this.ctx = this.canvas.getContext('2d');

        this.zr = zrender.init(this.canvas);

        await this._init();
        await this._initShake();
    }

    dismiss(): void {
        if (this.shakeWatch) {
            this.shakeWatch.unsubscribe();
            this.shakeWatch = null;
        }
        this.viewCtrl.dismiss();
    }

    async _init() {
        this.tearDay = getDate(await this.storage.get(STORE_KEY.TORN_DATE));
        this.isEmpty = !this.tearDay || !this.tearDay.isValid();

        await this._render();
    }

    protected async _render() {
        if (this.isEmpty) {
            return;
        }

        const imgScale = 0.8;
        const cw = this.canvas.width;
        const ch = this.canvas.height;

        let touchTarget = null;
        let lastX;
        let lastY;
        const days = Math.min(7, this.tearDay.diff(moment('2018-12-30'), 'day'));
        let date = this.tearDay.clone();
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

                    const dx = (cw - targetWidth) * Math.random();
                    const dy = (ch - targetHeight) * Math.random();
                    const rotate = (Math.random() * 2 - 1) * 15 / 180 * Math.PI;

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

                    zrImg.on('mousedown', function (e) {
                        touchTarget = e.target;
                        touchTarget.attr('z', ++z);
                        lastX = e.offsetX;
                        lastY = e.offsetY;
                    });

                    zrImg.on('mousemove', e => {
                        if (!touchTarget) {
                            return;
                        }

                        if (!this.isTouchMoved) {
                            this.logService.logEvent(PAGE_NAME, 'interacted');
                            this.isTouchMoved = true;
                        }

                        const oldStyle = touchTarget.style;
                        const newX = oldStyle.x + (e.offsetX - lastX);
                        const newY = oldStyle.y + (e.offsetY - lastY);
                        touchTarget.attr({
                            style: {
                                x: newX,
                                y: newY
                            }
                        });
                        lastX = e.offsetX;
                        lastY = e.offsetY;
                    });

                    zrImg.on('mouseup', function (e) {
                        touchTarget = null;
                        lastX = null;
                        lastY = null;
                    });

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

    protected async _initShake() {
        if (IS_DEBUG || !this.platform.is('ios')) {
            // Shake and Taptic supports iOS only
            return;
        }

        const isShaked = await this.historyService.hasShakedInHistory();
        if (!isShaked) {
            const toast = this.toastCtrl.create({
                message: '摇一摇可以把日历页排整齐哦！',
                duration: 3000,
                position: 'middle'
            });
            toast.present();
        }

        this.shakeWatch = this.shake.startWatch(100).subscribe(() => {
            this.taptic.impact({
                style: 'heavy'
            });
            this._dealWithOneShake();

            ++this.shakedTimes;
            if (this.shakedTimes % 5) {
                const toast = this.toastCtrl.create({
                    message: '暂时就是这样啦，更多功能敬请期待~',
                    duration: 3000,
                    position: 'middle'
                });
                toast.present();
            }
        });
    }

    protected _dealWithOneShake() {
        if (!this.isTouchMoved) {
            this.historyService.setShakedInHistory();
            this.isTouchMoved = true;
        }

        const step = (current, target) => {
            const ratio = 0.5;
            let value = current * ratio + target * (1 - ratio);
            return value;
        };

        for (let i = 0; i < this.historyPages.length; ++i) {
            const zrImg = this.historyPages[i].zrImg;
            if (zrImg) {
                zrImg.attr('rotation', step(zrImg.rotation, 0));
                zrImg.attr('style', {
                    x: step(zrImg.style.x, (this.canvas.width - this.imgRenderWidth) * 0.5),
                    y: step(zrImg.style.y, (this.canvas.height - this.imgRenderHeight) * 0.5)
                });
            }
        }
    }

}
