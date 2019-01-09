const shell = require('shelljs');
const moment = require('moment');
const chineseLunar = require('chinese-lunar');
moment.locale('zh-cn');

const darkSecondaryColor = 'rgba(51, 51, 51, 0.5)';

const themes = [/*'light', */'dark'];
for (let theme of themes) {
    const color = theme === 'light' ? '#fff' : '#666';

    for (let i = 1; i <= 365; ++i) {
        const day = moment.parseZone('2019-01-01T00:00:00+08:00').year(2019).dayOfYear(i)
            .hour(0).minute(0).second(0);

        // Lunar date info
        const lunar = chineseLunar.solarToLunar(day.toDate());
        const lunarText = '农历 ' + chineseLunar.format(lunar, 'Md');
        shot(lunarText, `../src/assets/imgs/fonts/ui/${theme}/lunar/${i}.png`, 14, darkSecondaryColor);
    }

    for (let i = 0; i < 7; ++i) {
        const day = moment().day(i);
        const name = day.format('dddd');
        const output = `../src/assets/imgs/fonts/ui/${theme}/dayOfWeek/${i}.png`;
        shot(name, output, 18, color);
    }

    for (let i = 0; i < 1; ++i) {
        const day = moment().month(i);
        const month = day.format('MMMM');
        const output = `../src/assets/imgs/fonts/ui/${theme}/month/${i}.png`;
        shot(month, output, 30, color);
    }
}


function shot(text, output, fontSize, color) {
    shell.exec(`font2img -f ./fonts/xique-juzhen.ttf -o ${output} --text "${text}" -c "${color}" `
        + `--font-size="${fontSize}px" --dpr=3`);
}
