import { Component, EventEmitter, HostBinding, Input, OnDestroy, Output } from '@angular/core';
import { PlayerInfo } from '@TomikaArome/ouistiti-shared';
import { SortableListComponent } from '../../utility/sortable-list.component';
import { Subject } from 'rxjs';
import { faCrown, faGripVertical, faUserCog } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'tmk-ouistiti-player-list-item',
  templateUrl: './player-list-item.component.html',
  styleUrls: ['./player-list-item.component.scss']
})
export class PlayerListItemComponent implements OnDestroy {
  @Input()
  player: PlayerInfo;
  @Input()
  isHost = false;
  @Input()
  grabbable = false;
  @Input()
  expandable = false;

  private _contentVisible = false;
  @Input()
  get contentVisible(): boolean { return this._contentVisible; }
  set contentVisible(value: boolean) { this._contentVisible = value; }

  @Output()
  contentVisibledToggled = new EventEmitter<boolean>();

  @HostBinding('class.tmk-player-list-item-dragging')
  dragging = false;

  private onDestroy$ = new Subject<void>();

  faCrown = faCrown;
  faUserCog = faUserCog;
  faGripVertical = faGripVertical;

  constructor(private sortableList: SortableListComponent<PlayerInfo>) {
    this.sortableList.draggingStateChanged.subscribe((player: PlayerInfo) => {
      this.contentVisible = false;
      this.dragging = !!player;
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  toggleContent() {
    this.contentVisible = !this.contentVisible;
    this.contentVisibledToggled.emit(this.contentVisible);
  }
}
