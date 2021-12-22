import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AdminPanelModule } from '../admin/admin-panel.module';

import { AppComponent } from './app.component';
import { IndexComponent } from '../index/index.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CardsTestComponent } from '../cards-test/cards-test.component';

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    CardsTestComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AdminPanelModule,
    BrowserAnimationsModule
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
