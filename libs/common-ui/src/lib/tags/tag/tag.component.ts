import { Component, Input } from '@angular/core';
import { ITag } from '@TomikaArome/common';

@Component({
  selector: 'tmk-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss']
})
export class TagComponent {
  @Input()
  data?: ITag;

  get label(): string {
    return this.data?.label ?? '';
  }
}
