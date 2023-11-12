import { Component, Input } from '@angular/core';
import { ITag } from '@TomikaArome/common';

@Component({
  selector: 'tmk-playground-tags-and-posts',
  template: `<tmk-tag [data]="tag"></tmk-tag>`,
  styles: [`
:host {
  display: block;
  padding: 20px;
}
  `]
})
export class TagsAndPostsComponent {
  tag: ITag = {
    label: 'urbanism'
  }
}
