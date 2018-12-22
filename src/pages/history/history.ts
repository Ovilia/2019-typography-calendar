import { Component, ElementRef, ViewChild } from '@angular/core';
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

    @ViewChild('historyCanvas') historyCanvasEl: ElementRef;
    protected canvas: HTMLCanvasElement;
    protected ctx: CanvasRenderingContext2D;

    public isEmpty: boolean;
    public historyPages: any[];

    constructor(
        public navCtrl: NavController,
        public viewCtrl: ViewController,
        public navParams: NavParams,
        public storage: StorageService
    ) {
        this.isEmpty = true;
        this.historyPages = [];
    }

    ionViewDidLoad() {
        this.canvas = this.historyCanvasEl.nativeElement;
        this.canvas.width = this.canvas.clientWidth * DPR;
        this.canvas.height = this.canvas.clientHeight * DPR;
        this.ctx = this.canvas.getContext('2d');

        this._init();
    }

    dismiss(): void {
        this.viewCtrl.dismiss();
    }

    async _init() {
        this.historyPages = await this.storage.get(STORE_KEY.HISTORY_PAGE) || [];
        if (!this.historyPages.length) {
            return;
        }
        this.isEmpty = false;

        await this._render();
    }

    protected async _render() {
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;

        const imgScale = 0.8;
        const cw = this.canvas.width;
        const ch = this.canvas.height;

        for (let i = 0; i < this.historyPages.length; ++i) {
            const page = this.historyPages[i];

            await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    const targetWidth = img.width * imgScale;
                    const targetHeight = img.height * imgScale;
                    const dx = (cw - targetWidth) * Math.random() * 0.5;
                    const dy = (ch - targetHeight) * Math.random() * 0.5;
                    const rotate = (Math.random() * 2 - 1) * 15 / 180 * Math.PI;

                    this.ctx.save();
                    this.ctx.translate(cw / 2, ch / 2);
                    this.ctx.rotate(rotate);
                    this.ctx.translate(-targetWidth / 2, -targetHeight / 2);
                    this.ctx.drawImage(img, dx, dy, targetWidth, targetHeight);
                    this.ctx.restore();
                    resolve();
                };
                img.onerror = reject;
                img.src = page.image;
            });
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
