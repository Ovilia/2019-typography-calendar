import * as moment from 'moment';

import { DPR } from './constants';
import CalendarCanvas from '../entities/calendarCanvas';
import { getImage } from './image';

export async function getExportBase64(dateMoment: moment.Moment) {
    const calendarCanvas = document.createElement('canvas');
    calendarCanvas.width = 335 * DPR;
    calendarCanvas.height = 531 * DPR;
    const calendar = new CalendarCanvas(dateMoment, calendarCanvas, true);
    await calendar.render();

    const outCanvas = document.createElement('canvas');
    outCanvas.width = 375 * DPR;
    outCanvas.height = 670 * DPR;
    const ctx = outCanvas.getContext('2d');

    const padding = 20 * DPR;

    ctx.fillStyle = '#F9F9F9';
    ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);

    ctx.shadowBlur = 25 * DPR;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.drawImage(calendarCanvas, padding, padding);
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'rgba(0, 0, 0, 0)';

    const downloadImg = await getImage('assets/imgs/export-download.png');
    ctx.drawImage(downloadImg, padding, 572 * DPR);

    return outCanvas.toDataURL();
}
