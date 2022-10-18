import { Component, EventEmitter, HostBinding, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { OuistitiError } from '@TomikaArome/ouistiti-shared';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'tmk-ouistiti-error-notification',
  template: '<div>Error: <b>{{ error.type }}</b></div><i>See DevTools for more information</i>',
  styleUrls: ['./error-notification.component.scss']
})
export class ErrorNotificationComponent implements OnInit, OnDestroy {
  @Input()
  error: OuistitiError;
  @Input()
  duration = -1;

  @Output()
  dismiss = new EventEmitter<void>();

  @HostBinding('class.hideErrorNotification')
  private hideErrorNotification = false;
  @HostBinding('style.--hide-animation-delay')
  private get hideAnimationDelay() {
    return (this.duration - 200) + 'ms';
  }

  private onDestroy$ = new Subject<void>();

  ngOnInit() {
    if (this.duration > -1) {
      timer(this.duration).pipe(takeUntil(this.onDestroy$)).subscribe(() => {
        this.hideErrorNotification = true;
        this.dismiss.emit();
      });
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
