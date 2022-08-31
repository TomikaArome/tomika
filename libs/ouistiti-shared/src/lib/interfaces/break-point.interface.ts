export interface BreakPointInfo {
  timerExpires?: number;
  acknowledgements?: { [key: string]: boolean };
  buffer?: BreakPointInfo;
}
