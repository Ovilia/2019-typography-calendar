import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import licenses from '../../utils/license';
import { FontPage } from '../font/font';

/**
 * Generated class for the LicensePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-license',
    templateUrl: 'license.html',
})
export class LicensePage {

    public items;

    constructor(public navCtrl: NavController, public navParams: NavParams) {
        console.log(licenses);
        this.items = licenses;
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad LicensePage');
    }

    openLicense(license) {
        this.navCtrl.push(FontPage, {
            licenseId: license.id
        });
    }

}
