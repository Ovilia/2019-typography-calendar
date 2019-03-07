import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, ToastController, Toast, Platform, AlertController } from 'ionic-angular';
import { Base64ToGallery } from '@ionic-native/base64-to-gallery';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { TapticEngine } from '@ionic-native/taptic-engine';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import * as moment from 'moment';

import CalendarCanvas from '../../entities/calendarCanvas';
import { getThemeColor, mainColor } from '../../utils/colors';
import { HistoryService } from '../../services/history';
import { StorageService } from '../../services/storage';
import { LogService } from '../../services/log';
import { IS_DEBUG, NOTIIFICATION_ID_DAILY, STORE_KEY, LAST_AVAILABLE_DATE } from '../../utils/constants';
import { getDate } from '../../utils/time';
import { AudioService } from '../../services/audio';
import { getExportBase64 } from '../../utils/share';
import random from '../../utils/random';

const PAGE_NAME = 'home';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    @ViewChild('mainCanvas') mainCanvasEl: ElementRef;
    @ViewChild('bgCanvas') bgCanvasEl: ElementRef;
    themeColor: string;

    public isFrontPage: boolean;
    public isDebug: boolean;

    protected mainCanvas: HTMLCanvasElement;
    protected bgCanvas: HTMLCanvasElement;
    protected mainCalendar: CalendarCanvas;
    protected bgCalendar: CalendarCanvas;
    protected currentDate: moment.Moment;
    protected isCanvasSweeping: boolean;
    protected isTearing: boolean;
    protected isTore: boolean;
    protected tearCnt: number;
    protected isAndroid: boolean;

    private touchStartY: number;
    private toast: Toast;

    constructor(
        public navCtrl: NavController,
        public toastCtrl: ToastController,
        public alertCtrl: AlertController,
        public localNotifications: LocalNotifications,
        public historyService: HistoryService,
        public base64ToGallery: Base64ToGallery,
        public audioService: AudioService,
        public logService: LogService,
        public storage: StorageService,
        public taptic: TapticEngine,
        public browser: InAppBrowser,
        public platfrom: Platform
    ) {
        this.isDebug = IS_DEBUG;
    }

    async init() {
        this.isFrontPage = true;
        this.isCanvasSweeping = false;
        this.isTearing = false;
        this.isTore = false;
        this.tearCnt = 0;

        const isFirst = await this.historyService.isFirstTear();
        if (isFirst) {
            this._toast('试试下拉撕日历吧！', 'top');
        }

        this.isAndroid = this.platfrom.is('android');

        this.mainCanvas = this.mainCanvasEl.nativeElement;
        this.bgCanvas = this.bgCanvasEl.nativeElement;

        let tearDate = await this.historyService.getTearDate();
        if (tearDate) {
            this.isFrontPage = false;
            tearDate = moment(tearDate).add(1, 'day') as any;
        }
        this.currentDate = moment.min(getDate(tearDate || '2018-12-31'), getDate('2019-12-31'));

        this.mainCalendar = new CalendarCanvas(this.currentDate, this.mainCanvas);
        this.bgCalendar = new CalendarCanvas(this.currentDate.clone().add(1, 'day'), this.bgCanvas);
        this.themeColor = tearDate ? getThemeColor(this.currentDate) : mainColor;
    }

    ionViewDidEnter() {
        if (IS_DEBUG) {
            this.init();
        }

        document.addEventListener('deviceready', () => {
            this.init();
            this.logService.logUserView();
            this.logService.logPageView(PAGE_NAME);
        });
    }

    setNotification() {
        if (IS_DEBUG) {
            return;
        }

        this.localNotifications.isScheduled(NOTIIFICATION_ID_DAILY)
            .then(isSheduled => {
                if (!isSheduled) {
                    this.logService.logEvent(PAGE_NAME, 'schedule_notify');
                    this.localNotifications.schedule({
                        id: NOTIIFICATION_ID_DAILY,
                        text: '快来撕今天的日历呀！',
                        trigger: {
                            every: {
                                hour: 10,
                                minute: 0
                            }
                        }
                    });
                }
                else {
                    this.logService.logEvent(PAGE_NAME, 'scheduled_notify_before');
                }
            });
        // TODO: log click event
    }

    async exportCanvas() {
        this.logService.logEvent(PAGE_NAME, 'export_today', this.currentDate.format('MM-DD'));

        const base64 = await getExportBase64(this.currentDate);
        this.base64ToGallery.base64ToGallery(base64).then(
            () => {
                this.logService.logEvent(PAGE_NAME, 'export_today_success');
                this._toast('已经保存好啦，快把我从相册分享出去嘛！');
            },
            err => {
                this.logService.logEvent(PAGE_NAME, 'export_today_fail', err);
                console.error(err);
                this._toast('啊呀，讨厌！为什么保存失败了呢……');
            }
        );
    }

    async nextPage() {
        this.logService.logEvent(PAGE_NAME, 'tear');

        if (!this.isTore) {
            // TODO: async here
            await this.audioService.init();
        }

        this.isTearing = true;
        this.isFrontPage = false;

        this.audioService.play('tear');

        if (!IS_DEBUG) {
            this.taptic.impact({
                style: 'light'
            })
            .catch(() => {});
        }
    }

    canTear() {
        if (IS_DEBUG) {
            return true;
        }
        const today = getDate(new Date());
        return this.isFrontPage || today.isAfter(this.currentDate, 'day');
    }

    setDate(date: moment.Moment, changeCurrent: boolean) {
        const bgCalendar = this.isCanvasSweeping ? this.mainCalendar : this.bgCalendar;
        bgCalendar.setDate(date.clone().add(1, 'day'));

        if (changeCurrent) {
            const foreCalandar = this.isCanvasSweeping ? this.bgCalendar : this.mainCalendar;
            foreCalandar.setDate(date);
            this.currentDate = date;
        }

        this.themeColor = getThemeColor(date);
    }

    needUpgrade() {
        return this.currentDate.isSameOrAfter(getDate(LAST_AVAILABLE_DATE), 'day');
    }

    async afterTearOff() {
        const mainCanvas = this.isCanvasSweeping ? this.bgCanvas : this.mainCanvas;
        await this.historyService.tearNextDay(this.currentDate, mainCanvas.width, mainCanvas.height);

        this.isCanvasSweeping = !this.isCanvasSweeping;
        this.currentDate = this.currentDate.add(1, 'day');
        this.setDate(this.currentDate, false);
        this.isTearing = false;
        this.isTore = true;
        ++this.tearCnt;

        if (this.tearCnt === 3 && this.currentDate.diff(getDate(new Date()), 'day') <= -3) {
            this.promptTearMultiple();
        }
    }

    touchStart(event) {
        this.touchStartY = event.touches[0].clientY;
    }

    touchMove(event) {
        if (this.isTearing) {
            return;
        }

        const y = event.changedTouches[0].clientY;

        if (!this.isTearing && y - this.touchStartY > 20 && this.canTear() && !this.needUpgrade()) {
            this.nextPage();
        }
    }

    touchEnd(event) {
        if (this.isTearing) {
            return;
        }

        const y = event.changedTouches[0].clientY;

        if (y - this.touchStartY > 20) {
            if (!this.isTore) {
                this.setNotification();
            }
            if (!this.canTear()) {
                const text = [
                    '还不能撕哦~ 等日历上的日子过了吧！',
                    '明天再来撕吧！期待哟~',
                    '不要心急~ 今天也要好好过呀！',
                    '再等等吧！明天才能撕哦~',
                    '先把今天过好，再来撕明天的日历吧！'
                ];
                this._toast(random(text));
            } else if (this.needUpgrade()) {
                this.promptUpdate();
            }
        }
        else if (this.canTear()) {
            this._toast('下拉撕去当前页哟~');
        }
    }

    public menuClick() {
        this.logService.logClick(PAGE_NAME, 'menu');
        this._toastDismiss();
    }

    public promptTearMultiple() {
        const alert = this.alertCtrl.create({
            title: '是否直接撕到今天？',
            message: '可以在「撕下的日历」中查看被跳过的日历页，取消则手动一页页撕下。',
            buttons: [
                {
                    text: '取消',
                    role: 'cancel',
                    handler: () => {
                        this.logService.logEvent(PAGE_NAME, 'tear_multi_cancel');
                    }
                },
                {
                    text: '跳转到今天',
                    handler: () => {
                        this.logService.logEvent(PAGE_NAME, 'tear_multi_ok');
                        this.isCanvasSweeping = !this.isCanvasSweeping;
                        const today = getDate(new Date());
                        this.historyService.setTearDay(today.clone().subtract(1, 'day'))
                            .then(() => this.setDate(today, true));
                    }
                }
            ]
        });
        alert.present();
    }

    public promptUpdate() {
        const alert = this.alertCtrl.create({
            title: '更新日历',
            message: '后面的日历页需要更新后才能撕，是否前往更新？',
            buttons: [
                {
                    text: '取消',
                    role: 'cancel',
                    handler: () => {
                        this.logService.logEvent(PAGE_NAME, 'update_cancel');
                    }
                },
                {
                    text: '更新',
                    handler: () => {
                        this.logService.logEvent(PAGE_NAME, 'update_ok');
                        const url = 'http://zhangwenli.com/2019-typography-calendar/update-ios.html';
                        this.logService.logWebsite(PAGE_NAME, url, 'home-update');
                        this.browser.create(`${url}?ref=inapp-home-update`);
                    }
                }
            ]
        });
        alert.present();
    }

    protected _toast(text: string, position?: string) {
        this._toastDismiss();
        this.toast = this.toastCtrl.create({
            message: text,
            duration: 3000,
            position: position || 'middle'
        });
        this.toast.present();
    }

    protected _toastDismiss() {
        if (this.toast) {
            this.toast.dismiss();
        }
    }

    protected _clearStorage() {
        if (IS_DEBUG) {
            Promise.all([
                this.storage.set(STORE_KEY.TORN_DATE, ''),
                this.storage.set(STORE_KEY.HISTORY_PAGE, '')
            ])
            .then(() => this.init());
        }
    }

}
