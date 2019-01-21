import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, ToastController, Toast, Platform } from 'ionic-angular';
import { Base64ToGallery } from '@ionic-native/base64-to-gallery';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { TapticEngine } from '@ionic-native/taptic-engine';
import * as moment from 'moment';

import CalendarCanvas from '../../entities/calendarCanvas';
import { getThemeColor, mainColor } from '../../utils/colors';
import { HistoryService } from '../../services/history';
import { StorageService } from '../../services/storage';
import { LogService } from '../../services/log';
import { IS_DEBUG, NOTIIFICATION_ID_DAILY, STORE_KEY } from '../../utils/constants';
import { getDate } from '../../utils/time';
import { AudioService } from '../../services/audio';
import { getExportBase64 } from '../../utils/share';
import { convertUrlToDehydratedSegments } from 'ionic-angular/umd/navigation/url-serializer';

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

    protected mainCanvas: HTMLCanvasElement;
    protected bgCanvas: HTMLCanvasElement;
    protected mainCalendar: CalendarCanvas;
    protected bgCalendar: CalendarCanvas;
    protected currentDate: moment.Moment;
    protected isCanvasSweeping: boolean;
    protected isTearing: boolean;
    protected isTore: boolean;
    protected isAndroid: boolean;

    private touchStartY: number;
    private toast: Toast;
    private torn: number;
    private touchTimer: number;

    private isLongTouch: boolean;

    constructor(
        public navCtrl: NavController,
        public toastCtrl: ToastController,
        public localNotifications: LocalNotifications,
        public historyService: HistoryService,
        public base64ToGallery: Base64ToGallery,
        public audioService: AudioService,
        public logService: LogService,
        public storage: StorageService,
        public taptic: TapticEngine,
        public platfrom: Platform
    ) {
    }

    async init() {
        this.isFrontPage = true;
        this.isCanvasSweeping = false;
        this.isTearing = false;
        this.isTore = false;
        this.torn = 0;
        this.touchTimer = 0;
        this.isLongTouch = false;

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
            // Promise.all([
            //     this.storage.set(STORE_KEY.TORN_DATE, ''),
            //     this.storage.set(STORE_KEY.HISTORY_PAGE, '')
            // ])
            // .then(() => this.init());
            this.init();
        }

        document.addEventListener('deviceready', () => {
            this.init();
            this.logService.logUserView();
            this.logService.logPageView(PAGE_NAME);
        });
    }

    setNotification() {
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

        if (!this.isLongTouch)
        {
            this.torn += 1;
            if (this.torn >= 3 )
            {
                this._toast('试试长按一口气撕到今天吧！');
                this.torn = 0;
            }
        }

        if (!IS_DEBUG) {
            this.taptic.impact({
                style: 'light'
            })
            .catch(e => {
                this.logService.logEvent(PAGE_NAME, 'error_taptic', e);
                console.error(e);
            });
        }
    }

    canTear() {
        if (IS_DEBUG) {
            return true;
        }
        const today = getDate(new Date());
        return this.isFrontPage || today.isAfter(this.currentDate, 'day');
    }

    setDate(date: moment.Moment) {
        const bgCalendar = this.isCanvasSweeping ? this.mainCalendar : this.bgCalendar;
        bgCalendar.setDate(date.clone().add(1, 'day'));
        this.themeColor = getThemeColor(date);
    }

    needUpgrade() {
        return this.currentDate.isSameOrAfter(getDate('2019-01-31'));
    }

    async afterTearOff() {
        const mainCanvas = this.isCanvasSweeping ? this.bgCanvas : this.mainCanvas;
        await this.historyService.tearNextDay(this.currentDate, mainCanvas.width, mainCanvas.height);

        this.isCanvasSweeping = !this.isCanvasSweeping;
        this.currentDate = this.currentDate.add(1, 'day');
        this.setDate(this.currentDate);
        this.isTearing = false;
        this.isTore = true;
    }


    nextPages(days: number)
    {
        let timer = setInterval ( () => {
            if (days <= 0)
            {
                clearInterval(timer);
            }
            days --;
            this.nextPage();
        }, 900)

    }
    onLongTouch = () => 
    {
        this.isLongTouch = true;
        let daysBetween = moment(new Date()).diff(this.currentDate, 'days');
        this.nextPages(daysBetween);
    }
    touchStart(event) {
        this.touchStartY = event.touches[0].clientY;
        this.touchTimer = setTimeout(this.onLongTouch, 1500); 
    }

    touchMove(event) {
        if (this.isTearing) {
            return
        }

        const y = event.changedTouches[0].clientY;

        if (!this.isTearing && y - this.touchStartY > 20 && this.canTear() && !this.needUpgrade()) {
            this.nextPage();
        }

        if (this.touchTimer)
        {
            clearTimeout(this.touchTimer);
        }
        this.isLongTouch = false;
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
                this._toast('还不能撕哦~ 等日历上的日子过了吧！');
            } else if (this.needUpgrade()) {
                this._toast('后面的日历页需要更新一下 App 哦！');
            }
        }
        else {
            this._toast('下拉撕去当前页哟~');
        }

        if (this.touchTimer)
        {
            clearTimeout(this.touchTimer);
        }
        this.isLongTouch = false;
    }

    public menuClick() {
        this.logService.logClick(PAGE_NAME, 'menu');
        this._toastDismiss();
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

}
