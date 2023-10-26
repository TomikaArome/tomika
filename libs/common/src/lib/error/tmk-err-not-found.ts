import { TmkErr, TmkErrDetails } from './tmk-err';

export interface TmkErrNotFoundDetails extends TmkErrDetails {
  collection: string;
  propertyName: string;
  value: unknown;
}

export class TmkErrNotFound extends TmkErr {
  details: TmkErrNotFoundDetails;

  constructor(details: TmkErrNotFoundDetails, ...params: any[]) {
    super(details, ...params);
  }

  getMessage(): string {
    return this.message || `A document in the "${this.details.collection}" collection with the value "${this.details.value}" for "${this.details.propertyName}" could not be found`;
  }
}
