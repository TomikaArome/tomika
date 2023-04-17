import { Component } from '@angular/core';
import { DatatableHeader, DatatableService, GripDraggedEvent } from '@TomikaArome/common-ui';

@Component({
  selector: 'tmk-playground-root',
  templateUrl: './playground-root.component.html',
  styleUrls: ['./playground-root.component.scss'],
})
export class PlaygroundRootComponent {
  headers: DatatableHeader[] = [
    {
      key: 'id',
      label: 'ID',
      size: 50
    },
    {
      key: 'name',
      label: 'Name',
      resizeable: true
    },
    {
      key: 'level',
      label: 'Freshness',
      resizeable: true
    },
    {
      key: 'expToLevelUp',
      label: 'Freshness remaining',
      resizeable: true
    },
    {
      key: 'totalExp',
      label: 'Total freshness'
    }
  ];

  data = [
    {
      id: 0,
      name: 'Sploosh-o-matic',
      level: 1,
      expToLevelUp: 5960,
      totalExp: 5960
    },
    {
      id: 10,
      name: 'Splattershot Jr.',
      level: 1,
      expToLevelUp: 4000,
      totalExp: 21000
    },
    {
      id: 11,
      name: 'Custom Splattershot Jr.',
      level: 2,
      expToLevelUp: 34530,
      totalExp: 25470
    },
    {
      id: 20,
      name: 'Splash-o-matic',
      level: 3,
      expToLevelUp: 97565,
      totalExp: 62435
    }
  ];

  xPos = 0;
  yPos = 0;
  draggable = true;

  datatableInit(service: DatatableService) {
    service.setHeaders(this.headers);
    service.setRecords(this.data);
  }

  move(event: GripDraggedEvent) {
    this.xPos += event.changeSinceLastStep.x;
    this.yPos += event.changeSinceLastStep.y;
  }
}
