const shell = require('shelljs');
const fs = require('fs');

const lightColor = '#fff';
const darkMainColor = '#555';
const darkSecondaryColor = '#777';

const dayInfoLines = fs.readFileSync('../src/data/dayInfo.txt').toString().split('\n');
for (let line of dayInfoLines) {
    if (line && line[0] !== '#') {
        const parts = line.split('|');

        const date = parts[0].trim();
        const name = parts[1].trim();
        const file = parts[2].trim();
        const story = parts[3].trim();

        const dayOfMonth = date.substr(date.indexOf('.') + 1);
        shell.exec(`font2img -f ./fonts/${file}.ttf -o ../src/assets/imgs/fonts/date/light/${date}.png`
            + ` --text ${dayOfMonth} -c "${lightColor}" --font-size="350px" --dpr=2`);
        shell.exec(`font2img -f ./fonts/${file}.ttf -o ../src/assets/imgs/fonts/date/dark/${date}.png`
            + ` --text ${dayOfMonth} -c "${darkMainColor}" --font-size="350px" --dpr=2`);

        shell.exec(`font2img -f ./fonts/${file}.ttf -o ../src/assets/imgs/fonts/fontName/light/${date}.png`
        + ` --text ${name} -c "${lightColor}" --font-size="20px" --dpr=2`);
        shell.exec(`font2img -f ./fonts/${file}.ttf -o ../src/assets/imgs/fonts/fontName/dark/${date}.png`
            + ` --text ${name} -c "${darkMainColor}" --font-size="20px" --dpr=2`);

        shell.exec(`font2img -f ./fonts/xique-juzhen.ttf -o ../src/assets/imgs/fonts/story/light/${date}.png`
        + ` --text ${story} -c "${lightColor}" --font-size="15px" --dpr=2 --max-width=280 --line-height=0.6`);
        shell.exec(`font2img -f ./fonts/xique-juzhen.ttf -o ../src/assets/imgs/fonts/story/dark/${date}.png`
            + ` --text ${story} -c "${darkSecondaryColor}" --font-size="15px" --dpr=2 --max-width=280 --line-height=0.6`);
    }
}
