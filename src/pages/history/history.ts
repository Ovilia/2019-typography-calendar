import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { StorageService } from '../../services/storage';
import { STORE_KEY, DPR } from '../../utils/constants';

/**
 * Generated class for the HistoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-history',
    templateUrl: 'history.html',
})
export class HistoryPage {

    public historyPages: any[];

    constructor(
        public navCtrl: NavController,
        public viewCtrl: ViewController,
        public navParams: NavParams,
        public storage: StorageService
    ) {
        this.historyPages = [];

        this._init();
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad HistoryPage');
    }

    dismiss(): void {
            this.viewCtrl.dismiss();
    }

    async _init() {
        const pages = await this.storage.get(STORE_KEY.HISTORY_PAGE);
        this.historyPages = [];
        for (let i = 0; i < 8; ++i) {
            this.historyPages.push(Object.assign({}, pages[0]));
        }
        console.log(this.historyPages);

        const pageWidth = window.innerWidth;
        const pageHeight = window.innerHeight - 40; // TODO: navbar height
        const imgSize = await this._getImageSize(pages[0].image) as any;
        const imgScale = 0.6;
        const imgWidth = imgSize.width * imgScale;
        const imgHeight = imgSize.height * imgScale;

        for (let i = 0; i < this.historyPages.length; ++i) {
            const page = this.historyPages[i];
            page.style = {
                width: imgScale * 100 + '%',
                left: (pageWidth - imgWidth) * Math.random() + 'px',
                top: (pageHeight - imgHeight) * Math.random() + 'px',
                transform: 'rotateZ(' + (Math.random() * 2 - 1) * 30 + 'deg)'
            };
            console.log(page.style);
        }
    }

    async _getImageSize(src) {
        return await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                console.log(img.width, img.height);
                resolve({
                    width: img.width / DPR,
                    height: img.height / DPR
                });
            };
            img.onerror = reject;
            img.src = src;
        });
    }

}
