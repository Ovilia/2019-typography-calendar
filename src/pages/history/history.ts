import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import * as zrender from 'zrender';

import { StorageService } from '../../services/storage';
import { LogService } from '../../services/log';
import { STORE_KEY, DPR } from '../../utils/constants';

const PAGE_NAME = 'history';

@Component({
    selector: 'page-history',
    templateUrl: 'history.html',
})
export class HistoryPage {

    @ViewChild('historyCanvas') historyCanvasEl: ElementRef;
    protected canvas: HTMLCanvasElement;
    protected ctx: CanvasRenderingContext2D;
    protected zr: any;

    public isEmpty: boolean;
    public historyPages: any[];

    protected height: number;
    protected isInteracted: boolean;

    constructor(
        public navCtrl: NavController,
        public viewCtrl: ViewController,
        public navParams: NavParams,
        public storage: StorageService,
        public logService: LogService
    ) {
        this.isEmpty = true;
        this.historyPages = [];
        this.isInteracted = false;
    }

    ionViewDidLoad() {
        this.logService.logPageView(PAGE_NAME);

        this.canvas = this.historyCanvasEl.nativeElement;
        this.height = this.canvas.clientHeight + 20;
        this.canvas.width = this.canvas.clientWidth * DPR;
        this.canvas.height = this.height * DPR;
        this.ctx = this.canvas.getContext('2d');

        this.zr = zrender.init(this.canvas);

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
        const imgScale = 0.8;
        const cw = this.canvas.width;
        const ch = this.canvas.height;

        let touchTarget = null;
        let z = 0;
        let lastX;
        let lastY;

        for (let i = 0; i < this.historyPages.length; ++i) {
            const page = this.historyPages[i];

            await new Promise((resolve, reject) => {
                const img = new Image();
                let zrImg;

                img.onload = () => {
                    const targetWidth = img.width * imgScale;
                    const targetHeight = img.height * imgScale;
                    const dx = (cw - targetWidth) * Math.random();
                    const dy = (ch - targetHeight) * Math.random();
                    const rotate = (Math.random() * 2 - 1) * 15 / 180 * Math.PI;

                    zrImg = new zrender.Image({
                        style: {
                            image: img,
                            x: dx,
                            y: dy,
                            width: targetWidth,
                            height: targetHeight,
                            shadowBlur: 20,
                            shadowColor: 'rgba(0, 0, 0, 0.15)',
                            shadowOffsetX: 2,
                            shadowOffsetY: 2
                        },
                        rotation: rotate,
                        origin: [targetWidth / 2, targetHeight / 2]
                    });

                    zrImg.on('mousedown', function (e) {
                        touchTarget = e.target;
                        touchTarget.attr('z', ++z);
                        lastX = e.offsetX;
                        lastY = e.offsetY;
                    });

                    zrImg.on('mousemove', e => {
                        if (!touchTarget) {
                            return;
                        }

                        if (!this.isInteracted) {
                            this.logService.logEvent(PAGE_NAME, 'interacted');
                            this.isInteracted = true;
                        }

                        const oldStyle = touchTarget.style;
                        const newX = oldStyle.x + (e.offsetX - lastX);
                        const newY = oldStyle.y + (e.offsetY - lastY);
                        touchTarget.attr({
                            style: {
                                x: newX,
                                y: newY
                            }
                        });
                        lastX = e.offsetX;
                        lastY = e.offsetY;
                    });

                    zrImg.on('mouseup', function (e) {
                        touchTarget = null;
                        lastX = null;
                        lastY = null;
                    });

                    this.zr.add(zrImg);
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
