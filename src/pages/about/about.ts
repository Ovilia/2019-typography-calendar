import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController, Platform } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InAppBrowser } from '@ionic-native/in-app-browser';

import { VERSION, IS_DEBUG } from '../../utils/constants';
import { LogService } from '../../services/log';

const PAGE_NAME = 'about';

@Component({
    selector: 'page-about',
    templateUrl: 'about.html'
})
export class AboutPage {

    public version: string
    public isLatestVersion: boolean;
    public isAndroid: boolean;

    constructor(
        public viewCtrl: ViewController,
        public navCtrl: NavController,
        public navParams: NavParams,
        public http: HttpClient,
        public browser: InAppBrowser,
        public alertCtrl: AlertController,
        public platform: Platform,
        public logService: LogService
    ) {
        this.version = VERSION;
        this.isLatestVersion = null;

        this.checkVersion();

        if (this.platform.is('android')) {
            this.isAndroid = true;
        }
    }

    ionViewWillEnter() {
        this.logService.logPageView(PAGE_NAME);
    }

    dismiss(): void {
        this.viewCtrl.dismiss();
    }

    promptLike() {
        const alert = this.alertCtrl.create({
            title: '喜欢我吗？',
            message: '喜欢的话，赏个好评吧！',
            buttons: [
                {
                    text: '不要',
                    role: 'cancel',
                    handler: () => {
                        this.logService.logEvent(PAGE_NAME, 'like_cancel');
                    }
                },
                {
                    text: '好啊',
                    handler: () => {
                        this.logService.logEvent(PAGE_NAME, 'like_ok');
                        this._openIosAppStore('review');
                    }
                }
            ]
        });
        alert.present();
    }

    goWebsite() {
        const url = 'http://zhangwenli.com/2019-typography-calendar/';
        this.logService.logWebsite(PAGE_NAME, url, 'about_version');
        this.browser.create(url);
    }

    checkVersion() {
        let headers =new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'text/javascript'
          });

        this.http.get('https://umeecorn.com/calendar2019/version.json', { headers })
            .subscribe(data => {
                if (data) {
                    const platform = this.isAndroid ? 'android' : 'ios';
                    const release = (data as any).lastRelease[platform];
                    if (release) {
                        if (IS_DEBUG && release.version !== this.version) {
                            console.log('Release: ' + release.version, 'Current: ' + this.version);
                        }
                        this.isLatestVersion = release.version === this.version;
                    }
                }
            });
    }

    update() {
        if (this.isAndroid) {
            const url = 'http://zhangwenli.com/2019-typography-calendar/download-android.html';
            this.logService.logWebsite(PAGE_NAME, url, 'update-android');
            this.browser.create(`${url}?ref=inapp-update-android`);
        }
        this.updateIos();
    }

    updateIos() {
        this._openIosAppStore('update-ios');
    }

    protected _openIosAppStore(ref?: string) {
        const url = 'http://zhangwenli.com/2019-typography-calendar/update-ios.html';
        this.logService.logWebsite(PAGE_NAME, url, ref);
        this.browser.create(`${url}?ref=inapp-${ref}`);
    }

}
