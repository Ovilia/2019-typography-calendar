const shell = require('shelljs');
const fs = require('fs');

const darkMainColor = '#555';
const darkSecondaryColor = 'rgba(85, 85, 85, 0.8)';
const darkNoteColor = 'rgba(51, 51, 51, 0.5)';
const goldColor = '#f3af2d';

const dayInfoLines = fs.readFileSync('../src/data/dayInfo.ts').toString().split('\n');
let isComment = false;
for (let line of dayInfoLines) {
    if (line === '<!--') {
        isComment = true;
        continue;
    }
    if (line === '-->') {
        isComment = false;
        continue;
    }

    if (!isComment && line && line.indexOf('#') !== 0 && line.indexOf('|') >= 0) {
        const parts = line.split('|');

        const date = parts[0].trim();
        const name = parts[1].trim();
        const file = parts[2].trim();
        const story = parts[3].trim();
        const note = parts[4].trim();

        const fontPath = file.indexOf('.') > -1 ? './fonts/' + file : file;
        console.log('Dealing with', date, name);

        let fontColor = darkMainColor;
        let storyColor = darkSecondaryColor;
        let noteColor = darkNoteColor;
        if (date === '2.5') {
            fontColor = '#333';
            storyColor = '#444';
            noteColor = '#494949';
            fontColor = goldColor;
        }

        if (file) {
            const dayOfMonth = date.substr(date.indexOf('.') + 1);
            switch (date) {
                case '2.5':
                    shell.exec(`font2img -f "${fontPath}" -o ../src/assets/imgs/fonts/date/dark/${date}.png`
                        + ` --text "过#年#好" -c "${fontColor}" --font-size="270px" --dpr=3 --line-height=0.3`);
                    break;

                default:
                    shell.exec(`font2img -f "${fontPath}" -o ../src/assets/imgs/fonts/date/dark/${date}.png`
                        + ` --text "${dayOfMonth}" -c "${darkMainColor}" --font-size="350px" --dpr=3`);
            }
        }

        if (name) {
            switch (date) {
                case '3.9':
                case '3.12':
                    shell.exec(`font2img -f "${fontPath}" -o ../src/assets/imgs/fonts/fontName/dark/${date}.png`
                        + ` --text "${name}" -c "${fontColor}" --font-size="18px" --dpr=3 --line-height=0.45`);
                    break;
                default:
                    shell.exec(`font2img -f "${fontPath}" -o ../src/assets/imgs/fonts/fontName/dark/${date}.png`
                        + ` --text "${name}" -c "${fontColor}" --font-size="23px" --dpr=3 --line-height=0.45`);
            }
        }

        switch (date) {
            case '2.19':
            case '3.16':
            case '9.17':
            case '9.23':
            case '10.1':
                shell.exec(`font2img -f "${fontPath}" -o ../src/assets/imgs/fonts/story/dark/${date}.png`
                    + ` --text "${story}" -c "${storyColor}" --font-size="18px" --dpr=3 --max-width=280 --line-height=0.4`);
                break;
            default:
                shell.exec(`font2img -f ./fonts/xique-juzhen.ttf -o ../src/assets/imgs/fonts/story/dark/${date}.png`
                    + ` --text "${story}" -c "${storyColor}" --font-size="18px" --dpr=3 --max-width=280 --line-height=0.4`);
        }

        if (note) {
            switch (date) {
                case '2.19':
                    shell.exec(`font2img -f "${fontPath}" -o ../src/assets/imgs/fonts/note/dark/${date}.png`
                        + ` --text "${note}" -c "${noteColor}" --font-size="14px" --dpr=3 --max-width=280 `
                        + `--line-height=0.4`);
                    break;
                default:
                    shell.exec(`font2img -f ./fonts/xique-juzhen.ttf -o ../src/assets/imgs/fonts/note/dark/${date}.png`
                        + ` --text "${note}" -c "${noteColor}" --font-size="14px" --dpr=3 --max-width=280 `
                        + `--line-height=0.4`);
            }
        }

        console.log('-------');
    }
}
