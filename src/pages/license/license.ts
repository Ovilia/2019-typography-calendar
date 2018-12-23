import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import licenses from '../../utils/license';
import { FontPage } from '../font/font';

/**
 * Generated class for the LicensePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-license',
    templateUrl: 'license.html',
})
export class LicensePage {

    public items;

    constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams) {
        this.items = licenses;
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
