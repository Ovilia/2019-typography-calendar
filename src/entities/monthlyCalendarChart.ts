import echarts from 'echarts';
import * as moment from 'moment';
import { getDate } from '../utils/time';
import { getThemeColor } from '../utils/colors';
import { HistoryPage } from '../pages/history/history';
import { DESIGN_WIDTH } from '../utils/constants';

export default class MonthlyCalendarChart {

    chart: any;
    viewMonth: number;
    width: number;
    height: number;

    constructor(container: HTMLDivElement, protected tearDay: moment.Moment, viewMonth: number, history: HistoryPage) {
        this.chart = echarts.init(container);

        this.width = this.chart.getWidth();
        this.height = this.chart.getHeight();

        this.update(viewMonth);

        this.chart.on('click', param => {
            history.onDaySelect(param.value[0]);
        });
    }

    update(viewMonth: number) {
        this.viewMonth = viewMonth;
        const ratio = this.width / DESIGN_WIDTH;

        const renderItem = function(params, api) {
            const day = getDate(new Date(api.value(0)));
            const dateName = day.format('M.D');
            var cellPoint = api.coord(day);
            var cellWidth = params.coordSys.cellWidth;
            var cellHeight = params.coordSys.cellHeight;
            const img = `assets/imgs/fonts/date/dark/${dateName}.png`;

            if (isNaN(cellPoint[0]) || isNaN(cellPoint[1])) {
                return;
            }

            const padding = 8 * ratio;
            const pos = [cellPoint[0] - cellWidth / 2, cellPoint[1] - cellHeight / 2];
            return {
                type: 'group',
                children: [{
                    type: 'rect',
                    position: pos,
                    style: api.style({fill: getThemeColor(day)}),
                    shape: {
                        x: 1,
                        y: 1,
                        width: cellWidth - 2,
                        height: cellHeight - 2
                    }
                }, {
                    type: 'image',
                    position: [pos[0] + padding, pos[1] + padding],
                    style: api.style({
                        image: img,
                        height: 18 * ratio
                    })
                }],
                name: 'group'
            };
        };

        const data = [];
        const month = moment().year(2019).month(viewMonth);
        for (let i = 1, len = month.daysInMonth(); i <= len; ++i) {
            const date = getDate(month.date(i));
            if (date.isSameOrBefore(this.tearDay)) {
                data.push([date.toDate().getTime(), 1]);
            }
        }

        this.chart.setOption({
            calendar: {
                left: 'center',
                top: 'middle',
                cellSize: [50 * ratio, 50 * ratio],
                range: `2019-${viewMonth + 1}`,
                orient: 'vertical',
                splitLine: {
                    lineStyle: {
                        color: '#eee'
                    }
                },
                itemStyle: {
                    color: '#f6f6f6',
                    borderColor: '#eee'
                },
                yearLabel: {
                    show: false
                },
                monthLabel: {
                    show: false
                },
                dayLabel: {
                    show: false
                }
            },
            series: [{
                type: 'custom',
                coordinateSystem: 'calendar',
                renderItem: renderItem,
                data: data
            }],
            animation: false
        });
    }

    nextMonth() {
        if (this.viewMonth < 11) {
            this.update(this.viewMonth + 1);
        }
        else {
            console.warn('nextMonth', (this.viewMonth + 1), 'is invalid.');
        }
    }

    prevMonth() {
        if (this.viewMonth > 0) {
            this.update(this.viewMonth - 1);
        }
        else {
            console.warn('nextMonth', (this.viewMonth - 1), 'is invalid.');
        }
    }

}
