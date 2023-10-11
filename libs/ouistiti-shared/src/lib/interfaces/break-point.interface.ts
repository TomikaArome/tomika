export interface BreakPointInfo {
  serverTimestamp: number;
  timerExpires?: number;
  acknowledgements?: { [key: string]: boolean };
  buffer?: BreakPointInfo;
}
