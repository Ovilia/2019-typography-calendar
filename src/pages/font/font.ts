import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import licenses from '../../utils/license';
import { LogService } from '../../services/log';

const PAGE_NAME = 'license';

@Component({
    selector: 'page-font',
    templateUrl: 'font.html',
})
export class FontPage {

    title: string;
    desc: string[];
    fonts: string[];
    detail: string[];

    constructor(
        public viewCtrl: ViewController,
        public navCtrl: NavController,
        public navParams: NavParams,
        public logService: LogService
    ) {
        const licenseId = navParams.get('licenseId');

        for (let l of licenses) {
            const item = l as any;
            if (item.id === licenseId) {
                this.fonts = item.fonts;
                this.desc = item.desc ? item.desc.split('\n') : [];
                this.title = item.name;
                this.detail = item.detail ? item.detail.split('\n') : [];
                break;
            }
        }
    }

    ionViewWillEnter() {
        this.logService.logPageView(PAGE_NAME);
    }

    dismiss(): void {
        this.viewCtrl.dismiss();
    }

}
