import { Route } from '@angular/router';
import { TagsAndPostsComponent } from './tags-and-posts.component';
import { PlaygroundRootComponent } from './playground-root.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: PlaygroundRootComponent
  },
  {
    path: 'tags-and-posts',
    component: TagsAndPostsComponent
  }
];
