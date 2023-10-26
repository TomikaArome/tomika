import { TmkErr, TmkErrDetails } from './tmk-err';

export interface TmkErrNotFoundDetails extends TmkErrDetails {
  collection: string;
  propertyName: string;
  value: unknown;
}

export class TmkErrNotFound extends TmkErr {
  /**
   * Throws a TmkErrNotFound if something evaluates to false
   */
  static throwOnNotFound(something: unknown, details: TmkErrNotFoundDetails): unknown {
    if (!something) {
      throw new TmkErrNotFound(details);
    }
    return something;
  }

  details: TmkErrNotFoundDetails;

  constructor(details: TmkErrNotFoundDetails, ...params: any[]) {
    super(details, ...params);
  }

  getMessage(): string {
    return this.message || `A document in the "${this.details.collection}" collection with the value "${this.details.value}" for "${this.details.propertyName}" could not be found`;
  }
}
