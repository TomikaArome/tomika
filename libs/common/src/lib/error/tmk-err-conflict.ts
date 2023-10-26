import { TmkErr, TmkErrDetails } from './tmk-err';

export interface TmkErrConflictDetails extends TmkErrDetails {
  collection: string;
  propertyName: string;
  value: unknown;
}

export class TmkErrConflict extends TmkErr {
  /**
   * Throws a TmkErrConflict if something evaluates to true
   */
  static throwOnConflict(something: unknown, details: TmkErrConflictDetails): unknown {
    if (!!something) {
      throw new TmkErrConflict(details);
    }
    return something;
  }

  details: TmkErrConflictDetails;

  constructor(details: TmkErrConflictDetails, ...params: any[]) {
    super(details, ...params);
  }

  getMessage(): string {
    return this.message || `A document in the "${this.details.collection}" collection with the value "${this.details.value}" for "${this.details.propertyName}" already exists`;
  }
}
