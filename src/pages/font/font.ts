import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import licenses from '../../utils/license';

/**
 * Generated class for the FontPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-font',
    templateUrl: 'font.html',
})
export class FontPage {

    title: string;
    fonts: string[];

    constructor(public navCtrl: NavController, public navParams: NavParams) {
        const licenseId = navParams.get('licenseId');

        for (let l of licenses) {
            if (l.id === licenseId) {
                this.fonts = l.fonts;
                this.title = l.name;
                break;
            }
        }
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad FontPage');
    }

}
