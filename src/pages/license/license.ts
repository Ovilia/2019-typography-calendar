import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import licenses from '../../utils/license';
import { FontPage } from '../font/font';
import { LogService } from '../../services/log';

const PAGE_NAME = 'license';

@Component({
    selector: 'page-license',
    templateUrl: 'license.html',
})
export class LicensePage {

    public items;

    constructor(
        public viewCtrl: ViewController,
        public navCtrl: NavController,
        public navParams: NavParams,
        public logService: LogService
    ) {
        this.items = licenses;
    }

    ionViewWillEnter() {
        this.logService.logPageView(PAGE_NAME);
    }

    dismiss(): void {
        this.viewCtrl.dismiss();
    }

    openLicense(license) {
        this.navCtrl.push(FontPage, {
            licenseId: license.id
        });
    }

}
