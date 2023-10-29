export interface TmkErrObj {
  error: {
    type: string;
    message: string;
    thrownAt: Date;
    details?: TmkErrDetails;
  }
}

export declare type TmkErrDetails = object;

export class TmkErr extends Error {
  static buildFromObject(errorObj: TmkErrObj, classes: (typeof TmkErr)[]): TmkErr {
    const tmkErrClass = classes.find(className => {
      return className.name === errorObj.error.type;
    });
    const tmkErr = new tmkErrClass(errorObj.error.details);
    tmkErr.message = errorObj.error.message;
    tmkErr.thrownAt = errorObj.error.thrownAt;
    return tmkErr;
  }

  thrownAt: Date;
  details: TmkErrDetails;

  constructor(details: TmkErrDetails = {}, ...params) {
    super(...params);
    this.name = this.constructor.name;
    this.thrownAt = new Date();
    this.details = details;
  }

  getMessage(): string {
    return this.message || 'An error occurred';
  }

  toJSON(): TmkErrObj {
    const obj: TmkErrObj = {
      error: {
        type: this.name,
        message: this.getMessage(),
        thrownAt: this.thrownAt
      }
    };
    if (this.details) { obj.error.details = this.details; }
    return obj;
  }
}
