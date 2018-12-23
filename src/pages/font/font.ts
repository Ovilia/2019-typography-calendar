import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import licenses from '../../utils/license';

/**
 * Generated class for the FontPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-font',
    templateUrl: 'font.html',
})
export class FontPage {

    title: string;
    desc: string[];
    fonts: string[];
    detail: string[];

    constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams) {
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

    dismiss(): void {
        this.viewCtrl.dismiss();
    }

}
