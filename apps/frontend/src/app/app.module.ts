import { NgModule } from '@angular/core';

import { environment } from '../environments/environment';

import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AdminPanelModule } from '../admin/admin-panel.module';

import { AppComponent } from './app.component';
import { IndexComponent } from '../index/index.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CardsTestComponent } from '../cards-test/cards-test.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [AppComponent, IndexComponent, CardsTestComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AdminPanelModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
  ],
  bootstrap: [AppComponent],
  providers: [{
    provide: 'environment',
    useValue: environment
  }]
})
export class AppModule {}
