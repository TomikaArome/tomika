import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { PlaygroundRootComponent } from './playground-root.component';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app.routes';

@NgModule({
  declarations: [PlaygroundRootComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
  ],
  providers: [],
  bootstrap: [PlaygroundRootComponent],
})
export class AppModule {}
