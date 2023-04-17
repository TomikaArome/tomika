export interface DatatableHeader {
  key: string;
  label: string;
  resizeable?: boolean;
  size?: number;
}

export interface DatatableRecord {
  id: unknown;
  [key: string]: unknown;
}
