export const IS_DEBUG = (() => {
    return location.port === '8100';
})();
if (IS_DEBUG) {
    console.log('THIS IS IN DEBUG MODE.');
}

export const VERSION = '1.1.1';

export const DPR = 2;

export const DESIGN_WIDTH = 375;

export const STORE_KEY = {
    TORN_DATE: 'tornDate',
    HISTORY_PAGE: 'historyPage',
    FIRST_OPEN: 'firstOpen',
    FIRST_TEAR: 'firstTear'
};

export const NOTIIFICATION_ID_DAILY = 1;
