import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import * as moment from 'moment';

import { HomePage } from '../pages/home/home';
import { HistoryPage } from '../pages/history/history';
import { LicensePage } from '../pages/license/license';
import { HistoryService } from '../services/history';
import { AboutPage } from '../pages/about/about';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;

    rootPage: any = HomePage;

    pages: any[];

    constructor(
        public platform: Platform,
        public statusBar: StatusBar,
        public splashScreen: SplashScreen,
        public history: HistoryService,
        public androidFullScreen: AndroidFullScreen,
        public menuCtrl: MenuController
    ) {
        this.initializeApp();
        this.setPages();
    }

    initializeApp() {
        moment.locale('zh-cn');

        const enterHome = () => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
        };

        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            if (this.platform.is('android')) {
                this.androidFullScreen.isImmersiveModeSupported()
                    .then(err => {
                        console.log(err);
                        return this.androidFullScreen.immersiveMode();
                    })
                    .then(enterHome)
                    .catch(enterHome);
            }
            else {
                enterHome();
            }
        });
    }

    async setPages() {
        // used for an example of ngFor and navigation
        this.pages = [{
            title: '撕下的页面',
            img: 'menu-toren-pages.png',
            component: HistoryPage
        }, {
            title: '字体版权说明',
            img: 'menu-license.png',
            component: LicensePage
        }, {
            title: '关于「2019 字体日历」',
            img: 'menu-about.png',
            component: AboutPage
        }];

        // TODO: new feature here, not tested: Tear multiple pages
        // const tearDate = await this.history.getTearDate();
        // if (moment().subtract(4, 'day').isAfter(moment(tearDate))) {
        //     // To many pages to tear
        //     this.pages.push({
        //         title: '撕去今天之前的页面',
        //         action: () => {
        //             this.history.setTearDate()
        //         }
        //     });
        // }
    }

    openPage(page) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.push(page.component);
        this.menuCtrl.close();
    }
}
