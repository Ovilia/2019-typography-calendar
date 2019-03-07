import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NativeStorage } from '@ionic-native/native-storage';
import { Base64ToGallery } from '@ionic-native/base64-to-gallery';
import { Firebase } from '@ionic-native/firebase';
import { NativeAudio } from '@ionic-native/native-audio';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Market } from '@ionic-native/market';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { TapticEngine } from '@ionic-native/taptic-engine';
import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { SocialSharing } from '@ionic-native/social-sharing';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { HistoryPage } from '../pages/history/history';
import { LicensePage } from '../pages/license/license';
import { HistoryService } from '../services/history';
import { StorageService } from '../services/storage';
import { AudioService } from '../services/audio';
import { LogService } from '../services/log';
import { FontPage } from '../pages/font/font';
import { AboutPage } from '../pages/about/about';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    HistoryPage,
    LicensePage,
    FontPage,
    AboutPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    HistoryPage,
    LicensePage,
    FontPage,
    AboutPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    NativeStorage,
    HistoryService,
    StorageService,
    LogService,
    Base64ToGallery,
    Firebase,
    NativeAudio,
    AudioService,
    Market,
    InAppBrowser,
    LocalNotifications,
    AndroidFullScreen,
    AndroidPermissions,
    TapticEngine,
    SocialSharing
  ]
})
export class AppModule {}
