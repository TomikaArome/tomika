import { ITag, ITagCreate } from '../tags/tag.interface';

export interface IPost {
  _id?: string;
  revisions: IPostRevision[];
  tags: ITag[];
}

export interface IPostLatestRevision {
  _id?: string;
  title: string;
  content: string;
  submittedAt: Date;
  lastModifiedAt: Date;
  tags: (string | ITag)[];
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

export interface IPostRevisionCreate {
  title: string;
  content: string;
}
