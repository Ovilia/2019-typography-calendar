export function getThemeColor(date: string): string {
    switch (date) {
        case '1.1':
            return '#FFE06E';

        case '1.2':
            return '#DBEAB8';

        case '1.3':
            return '#F7CBB5';

        case '1.4':
            return '#C4CDE9';

        case '1.5':
            return '#E9B6C0';

        case '1.6':
            return '#BAEBC9';

        default:
            console.warn('Date ' + date + ' not defined theme color.');
            return '#FFE06E';
    }
}
