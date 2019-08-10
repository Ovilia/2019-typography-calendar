export const IS_DEBUG = (() => {
    return location.port === '8100';
    // return true;
})();
if (IS_DEBUG) {
    console.log('THIS IS IN DEBUG MODE.');
}

export const VERSION = '1.3.15';
export const LAST_AVAILABLE_DATE = '2019-09-01';

export const DPR = 2;
export const IMAGE_DPR = 3;

export const DESIGN_WIDTH = 375;

export const STORE_KEY = {
    TORN_DATE: 'tornDate',
    HISTORY_PAGE: 'historyPage',
    FIRST_OPEN: 'firstOpen',
    FIRST_TEAR: 'firstTear',
    DONT_ASK_AD_AGAIN: 'notAgainAd'
};

export const NOTIIFICATION_ID_DAILY = 1;
