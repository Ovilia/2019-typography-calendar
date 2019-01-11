import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';

@Injectable()
export class LogService {
    constructor(protected firebase: Firebase) {

    }

    logUserView() {
        this.firebase.logEvent('c_user_view', { hour: new Date().getHours() });
    }

    logPageView(page: string) {
        this.firebase.logEvent('c_page_view', { page });
    }

    logClick(page: string, name: string) {
        this.firebase.logEvent('c_click', { page, name });
    }

    logWebsite(page: string, url: string, refName: string) {
        this.firebase.logEvent('c_website', { page, name, ref: refName });
    }

    logEvent(page: string, name: string, data?: any) {
        if (data == null) {
            this.firebase.logEvent('c_' + name, { page, name });
        }
        else {
            this.firebase.logEvent('c_' + name, { page, name, data });
        }
    }
}
