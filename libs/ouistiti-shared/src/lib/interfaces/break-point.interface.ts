export interface BreakPointInfo {
  timerExpires?: number;
  acknowlegements?: { [key: string]: boolean };
  buffer?: BreakPointInfo;
}
