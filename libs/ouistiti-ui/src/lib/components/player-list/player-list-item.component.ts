import { Component, HostBinding, Input, OnDestroy } from '@angular/core';
import { PlayerInfo } from '@TomikaArome/ouistiti-shared';
import { PlayerService } from '../../services/player.service';
import { SortableListComponent } from '../../utility/sortable-list.component';
import { Subject } from 'rxjs';

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

  @HostBinding('class.tmk-player-list-item-dragging')
  dragging = false;

  contentVisible = false;
  private onDestroy$ = new Subject<void>();

  constructor(private sortableList: SortableListComponent<PlayerInfo>) {
    this.sortableList.draggingStateChanged.subscribe((player: PlayerInfo) => {
      this.contentVisible = false;
      this.dragging = !!player;
    });
  }

  get playerColourClass(): { [key: string]: string } {
    const obj = {};
    obj[PlayerService.getColourClassName(this.player.colour)] = true;
    return obj;
  }

  get playerSymbol(): string {
    return PlayerService.getSymbolIconName(this.player.symbol);
  }

  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  toggleContent() {
    this.contentVisible = !this.contentVisible;
  }
}
