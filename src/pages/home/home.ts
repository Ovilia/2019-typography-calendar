import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as moment from 'moment';

import CalendarCanvas from '../../entities/calendarCanvas';
import { getThemeColor } from '../../utils/colors';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('mainCanvas') mainCanvasEl: ElementRef;
  themeColor: string;

  protected mainCanvas: HTMLCanvasElement;
  protected mainCalendar: CalendarCanvas;
  protected currentDate: moment.Moment;

  private touchStartX: number;
  private touchStartY: number;

  constructor(public navCtrl: NavController) {
  }

  ionViewDidLoad() {
    this.mainCanvas = this.mainCanvasEl.nativeElement;
    console.log(this.mainCanvas.width, this.mainCanvas.height);

    this.currentDate = moment('2019-01-01');
    this.mainCalendar = new CalendarCanvas(this.currentDate, this.mainCanvas);
    this.themeColor = getThemeColor(this.currentDate.format('M.D'));
  }

  nextPage() {
    this.currentDate.add(1, 'day');
    this.setDate(this.currentDate);
  }

  setDate(date: moment.Moment) {
    this.mainCalendar.setDate(date);
    this.themeColor = getThemeColor(date.format('M.D'));
  }

  touchStart(event) {
    console.log('touch start', arguments);
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  touchMove(event) {
    console.log('touch move', arguments);
  }

  touchEnd(event) {
    console.log('touch end', arguments);
    const x = event.changedTouches[0].clientX;
    const y = event.changedTouches[0].clientY;

    if (y - this.touchStartY > 20) {
      console.log('new page');
      this.nextPage();
    }
  }

}
