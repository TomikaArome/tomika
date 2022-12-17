import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { PlaygroundRootComponent } from './playground-root.component';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';
import { CommonUiModule } from '@TomikaArome/common-ui';

@NgModule({
  declarations: [PlaygroundRootComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    CommonUiModule
  ],
  providers: [],
  bootstrap: [PlaygroundRootComponent],
})
export class AppModule {}
