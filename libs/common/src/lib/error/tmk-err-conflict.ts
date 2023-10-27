import { TmkErr, TmkErrDetails } from './tmk-err';

export interface TmkErrConflictDetails extends TmkErrDetails {
  collection?: string;
  path?: string;
  value?: unknown;
}

export class TmkErrConflict extends TmkErr {
  /**
   * Throws a TmkErrConflict if something evaluates to true
   */
  static throwOnConflict<T>(something: T, details: TmkErrConflictDetails): T {
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
    if (this.message) { return this.message; }
    const collectionPart = (!!this.details.collection) ? ` in the "${this.details.collection}" collection` : '';
    const valuePart = (!!this.details.value) ? ` with the value "${this.details.value}"` : ' with the provided value';
    const pathPart = (!!this.details.path) ? ` for the property at path "${this.details.path}"` : '';
    return this.message || `A document${collectionPart}${valuePart}${pathPart} already exists`;
  }
}
