export const TAG_LABEL_MIN_LENGTH = 2;
export const TAG_LABEL_MAX_LENGTH = 24;
export const TAG_LABEL_REGEX = /^[ a-z0-9_-]+$/i;

export interface ITag {
  _id?: string;
  label: string;
}

export interface ITagCreate {
  label: string;
}

// Same as ITagCreate
export type ITagUpdate = ITagCreate;
