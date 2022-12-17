import { DatatableRecord, DatatableHeader } from './model/datatable.model';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DatatableService {
  private _headers: DatatableHeader[] = [];
  get headers(): DatatableHeader[] {
    return this._headers;
  }

  private _records: DatatableRecord[] = [];
  get records(): DatatableRecord[] {
    return this._records;
  }

  getHeaderIndex(headerKey: string): number {
    return this._headers.findIndex((h: DatatableHeader) => h.key === headerKey);
  }
  getRecordIndex(recordId: unknown): number {
    return this._records.findIndex((r: DatatableRecord) => r.id === recordId);
  }

  /**
   * Configures the array of headers for the datatable
   * The array will be completely emptied and replaced with the new array, its order and exact new configuration
   * @param newHeaders The array of header configurations
   */
  setHeaders(newHeaders: DatatableHeader[]) {
    this._headers = newHeaders.reduce((acc: DatatableHeader[], curr: DatatableHeader) => {
      if (acc.findIndex((h: DatatableHeader) => h.key === curr.key) === -1) {
        acc.push(curr);
      }
      return acc;
    }, []);
  }

  /**
   * Sets the configuration for a header
   * @param header The header configuration object
   * @param index The index at which the header should appear in the order of headers
   *              undefined or -1 will replace a configuration for an existing without moving it, or if the header doesn't
   *              already exist, it will append it to the end
   */
  setHeader(header: DatatableHeader, index = -1) {
    const existingHeaderIndex = this._headers.findIndex((h: DatatableHeader) => h.key === header.key);
    if (existingHeaderIndex > -1) {
      this._headers.splice(existingHeaderIndex, 1);
    }
    const insertAtIndex = index > -1 ? index : (existingHeaderIndex > -1 ? existingHeaderIndex : this._headers.length);
    this._headers.splice(insertAtIndex, 0, header);
  }

  setRecords(newRecords: DatatableRecord[]) {
    this._records = newRecords;
  }
}
