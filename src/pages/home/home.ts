import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as moment from 'moment';

import CalendarCanvas from '../../entities/calendarCanvas';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  themeColor: string;

  @ViewChild('mainCanvas') mainCanvasEl: ElementRef;

  protected mainCanvas: HTMLCanvasElement;
  protected mainCalendar: CalendarCanvas;

  constructor(public navCtrl: NavController) {
  }

  ionViewDidLoad() {
    this.mainCanvas = this.mainCanvasEl.nativeElement;
    console.log(this.mainCanvas.width, this.mainCanvas.height);

    this.mainCalendar = new CalendarCanvas(moment('2019-01-01'), this.mainCanvas);
  }

}
