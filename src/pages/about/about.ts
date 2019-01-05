import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InAppBrowser } from '@ionic-native/in-app-browser';

import { VERSION } from '../../utils/constants';

/**
 * Generated class for the AboutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-about',
    templateUrl: 'about.html',
})
export class AboutPage {

    public version: string
    public isLatestVersion: boolean;

    constructor(
        public viewCtrl: ViewController,
        public navCtrl: NavController,
        public navParams: NavParams,
        // public http: HttpClient,
        public browser: InAppBrowser,
        public alertCtrl: AlertController
    ) {
        this.version = VERSION;
        this.isLatestVersion = null;

        // this.checkVersion();
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
                    }
                },
                {
                    text: '好啊',
                    handler: () => {
                        this.openIosAppStore('review');
                    }
                }
            ]
        });
        alert.present();
    }

    // checkVersion() {
    //     let headers =new HttpHeaders({
    //         'Content-Type': 'application/json',
    //         'Accept': 'text/javascript'
    //       });

    //     this.http.get('https://umeecorn.com/calendar2019/version.json', {headers})
    //         .subscribe(data => {
    //             if (data) {
    //                 const lastVersion = (data as any).lastRelease.ios.version;
    //                 this.isLatestVersion = lastVersion === this.version;
    //             }
    //         });
    // }

    // update() {
    //     this.updateIos();
    // }

    openIosAppStore(ref?: string) {
        this.browser.create('http://zhangwenli.com/2019-typography-calendar/update-ios.html?ref=' + ref);
    }

}
