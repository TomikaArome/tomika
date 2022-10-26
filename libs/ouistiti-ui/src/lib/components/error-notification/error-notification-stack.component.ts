import { Component } from '@angular/core';
import { SocketService } from '../../services/socket.service';
import { OuistitiError } from '@TomikaArome/ouistiti-shared';

@Component({
  selector: 'tmk-ouistiti-error-notification-stack',
  template: ` <tmk-ouistiti-error-notification
    *ngFor="let error of errorStack"
    [error]="error"
    [duration]="5000"
    (dismiss)="removeFromStack(error)"
  >
  </tmk-ouistiti-error-notification>`,
  styleUrls: ['./error-notification-stack.component.scss'],
})
export class ErrorNotificationStackComponent {
  errorStack: OuistitiError[] = [];

  constructor(private socketService: SocketService) {
    this.socketService.getEvent<OuistitiError>('error').subscribe((error) => {
      console.error(error);
      this.pushToStack(error);
    });
  }

  pushToStack(error: OuistitiError) {
    this.errorStack.push(error);
  }

  removeFromStack(error: OuistitiError) {
    this.errorStack.splice(this.errorStack.indexOf(error), 1);
  }
}
