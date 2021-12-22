export enum EventType {

}

export class Event {
  type: EventType;

  constructor(type: EventType) {
    this.type = type;
  }
}
