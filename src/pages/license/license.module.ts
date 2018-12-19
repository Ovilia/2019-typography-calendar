import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LicensePage } from './license';

@NgModule({
  declarations: [
    LicensePage,
  ],
  imports: [
    IonicPageModule.forChild(LicensePage),
  ],
})
export class LicensePageModule {}
