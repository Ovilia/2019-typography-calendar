import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, ToastController, Toast } from 'ionic-angular';
import { Base64ToGallery } from '@ionic-native/base64-to-gallery';
import * as moment from 'moment';

import CalendarCanvas from '../../entities/calendarCanvas';
import { getThemeColor, mainColor } from '../../utils/colors';
import { HistoryService } from '../../services/history';
import { StorageService } from '../../services/storage';
import { STORE_KEY, IS_DEBUG } from '../../utils/constants';
import { getDate } from '../../utils/time';
import { DayInfoService } from '../../services/dayInfo';

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
    protected mainCanvasTop: number;

    private touchStartX: number;
    private touchStartY: number;
    private toast: Toast;

    constructor(
        public navCtrl: NavController,
        public toastCtrl: ToastController,
        public historyService: HistoryService,
        public dateInfoService: DayInfoService,
        public base64ToGallery: Base64ToGallery,
        public storage: StorageService
    ) {
        if (IS_DEBUG) {
            storage.set(STORE_KEY.TORN_DATE, '');
            storage.set(STORE_KEY.HISTORY_PAGE, '');
        }

        this.isFrontPage = true;
        this.mainCanvasTop = 0;

        this.init();
    }

    async init() {
        if (await this.historyService.isFirstTear()) {
            setTimeout(() => {
                const text = this.isToday() ? '等日历上的日子过了，就可以下拉撕掉哦！' : '试试下拉撕日历吧！';
                this._toast(text, 'top');
            }, 3000);
        }
    }

    ionViewDidLoad() {
        this.mainCanvas = this.mainCanvasEl.nativeElement;
        this.bgCanvas = this.bgCanvasEl.nativeElement;

        this.historyService.getTearDate()
            .then(date => {
                if (date) {
                    this.isFrontPage = false;
                }
                this.currentDate = getDate(date || '2018-12-31');

                this.mainCalendar = new CalendarCanvas(this.currentDate, this.mainCanvas, this.dateInfoService);
                this.bgCalendar = new CalendarCanvas(this.currentDate.clone().add(1, 'day'),
                    this.bgCanvas, this.dateInfoService);
                this.themeColor = date ? getThemeColor(this.currentDate.format('M.D')) : mainColor;
            });
    }

    async exportCanvas() {
        const base64 = await this.mainCalendar.getRenderedBase64();
        this.base64ToGallery.base64ToGallery(base64).then(
            () => {
                this._toast('已经保存好啦，快把我从相册分享出去嘛！');
            },
            err => {
                this._toast('啊呀，讨厌！为什么保存失败了呢……');
                console.error(err);
            }
        );
    }

    nextPage() {
        if (this.currentDate.isSameOrAfter(getDate('2019-01-31'))) {
            this._toast('后面的日历页需要更新一下 App 哦！');
        }
        else {
            const setup = async () => {
                await this.historyService.tearNextDay(this.currentDate, this.mainCanvas.width, this.mainCanvas.height);
                this.currentDate = this.currentDate.add(1, 'day');
                this.setDate(this.currentDate);
                this.mainCanvasTop = 0;
            };

            const duration = 500;
            const start = new Date();
            const tick = () => {
                const now = new Date();
                const dtime = now.getTime() - start.getTime();
                if (dtime < duration) {
                    this.mainCanvasTop = 100 * Math.sin(dtime / duration * Math.PI / 2);
                    console.log(this.mainCanvasTop);
                    requestAnimationFrame(tick);
                }
                else {
                    setup();
                }
            };
            tick();
        }
    }

    isToday() {
        const today = moment(new Date());
        return today.isBefore(this.currentDate)
            || this.currentDate.format('YYYY.M.D') === today.format('YYYY.M.D');
    }

    setDate(date: moment.Moment) {
        this.mainCalendar.setDate(date);
        this.bgCalendar.setDate(date.clone().add(1, 'day'));
        this.themeColor = getThemeColor(date.format('M.D'));
    }

    touchStart(event) {
        console.log('touch start', arguments);
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;
    }

    touchMove(event) {
        console.log('touch move', arguments);
    }

    touchEnd(event) {
        console.log('touch end', arguments);
        const x = event.changedTouches[0].clientX;
        const y = event.changedTouches[0].clientY;

        // TODO: not tested yet
        if (y - this.touchStartY > 20) {
            if (this.isToday() && !IS_DEBUG) {
                this._toast('明天再来撕嘛！');
            }
            else {
                this.nextPage();
            }
        }
        else {
            this._toast('下拉撕去当前页');
        }
    }

    protected _toast(text: string, position?: string) {
        if (this.toast) {
            this.toast.dismissAll();
        }
        this.toast = this.toastCtrl.create({
            message: text,
            duration: 5000,
            position: position || 'middle'
        });
        this.toast.present();
    }

}
