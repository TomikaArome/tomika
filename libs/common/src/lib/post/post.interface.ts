import { ITag, ITagCreate } from './tag.interface';

export interface IPost {
  _id?: string;
  revisions: IPostRevision[];
  tags: ITag[];
}

export interface IPostRevision {
  title: string;
  content: string;
  submittedAt: Date;
}

export interface IPostCreate {
  title: string;
  content: string;
  tags: (string | ITagCreate)[];
}

// Same as IPostCreate, but all paths are optional to update
export type IPostUpdate = Partial<IPostCreate>;
