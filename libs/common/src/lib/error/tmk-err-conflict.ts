import { TmkErr, TmkErrDetails } from './tmk-err';

export interface TmkErrConflictDetails extends TmkErrDetails {
  collection: string;
  propertyName: string;
  value: unknown;
}

export class TmkErrConflict extends TmkErr {
  details: TmkErrConflictDetails;

  constructor(details: TmkErrConflictDetails, ...params: any[]) {
    super(details, ...params);
  }

  getMessage(): string {
    return this.message || `A document in the "${this.details.collection}" collection with the value "${this.details.value}" for "${this.details.propertyName}" already exists`;
  }
}
