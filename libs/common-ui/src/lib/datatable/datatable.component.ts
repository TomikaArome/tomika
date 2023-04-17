import { AfterViewInit, Component, ElementRef, EventEmitter, HostBinding, Output, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { DatatableService } from './datatable.service';
import { DatatableHeader } from './model/datatable.model';
import { DatatableHeaderContainerComponent } from './header-container/datatable-header-container.component';

interface DatatableHeaderSize {
  headerKey: string;
  strategy: 'auto' | 'set-non-changeable' | 'set-changeable';
  currentSize?: number;
}

@Component({
  selector: 'tmk-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
  providers: [DatatableService],
  encapsulation: ViewEncapsulation.None
})
export class DatatableComponent implements AfterViewInit {
  private static minimumCellSize = 50;

  hoveredHeaderDivider = '';
  heldHeaderDivider = false;
  private headerSizes: DatatableHeaderSize[] = [];

  @HostBinding('class.tmk-datatable') private className = true;

  @Output() init = new EventEmitter<DatatableService>();

  @HostBinding('style.--datatable-grid-template-headers')
  private get gridTemplateHeaders(): string {
    let allSetNonChangeable = true;
    return this.service.headers.map((h: DatatableHeader, i: number) => {
      const size = this.getHeaderSize(h);
      // If ever single visible header has a set non-changeable size, the last one should be overridden to auto
      allSetNonChangeable = allSetNonChangeable && size.strategy === 'set-non-changeable';
      const overrideToAuto = allSetNonChangeable && i === this.service.headers.length - 1;
      return size.strategy === 'auto' || overrideToAuto ? 'minmax(0, auto)' : `${size.currentSize}px`;
    }).join(' ');
  }
  @HostBinding('style.--datatable-grid-template-records')
  private get gridTemplateRecords(): string {
    return `auto repeat(${this.service.records.length}, 1fr)`;
  }

  get hasNoVisibleRecords(): boolean {
    return this.service.records.length === 0;
  }

  @ViewChildren(DatatableHeaderContainerComponent) private headerContainers!: QueryList<DatatableHeaderContainerComponent>;

  constructor(public service: DatatableService) {}

  getCellHorizontalPos(headerKey: string): number {
    return this.service.getHeaderIndex(headerKey);
  }
  getCellVerticalPos(recordId: unknown): number {
    return this.service.getRecordIndex(recordId) + 1;
  }

  isHeaderResizable(header: DatatableHeader): boolean {
    const headerIndex = this.service.getHeaderIndex(header.key);
    if (header.resizeable && headerIndex > -1) {
      return this.service.headers.slice(headerIndex + 1).reduce((acc: boolean, h: DatatableHeader) => {
        const hSize = this.getHeaderSize(h);
        return acc || hSize.strategy !== 'set-non-changeable';
      }, false);
    }
    return false;
  }

  setHoveredDivider(header?: DatatableHeader) {
    if (!this.heldHeaderDivider) {
      this.hoveredHeaderDivider = header && this.isHeaderResizable(header) ? header.key : '';
    }
  }

  ngAfterViewInit() {
    // Set timeout to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.init.emit(this.service);
    });
  }

  private getHeaderSize(header: DatatableHeader): DatatableHeaderSize {
    let size = this.headerSizes.find((hS: DatatableHeaderSize) => hS.headerKey === header.key);
    if (!size) {
      size = {
        headerKey: header.key,
        strategy: header.size ? (header.resizeable ? 'set-changeable' : 'set-non-changeable') : 'auto'
      };
      if (size.strategy !== 'auto') {
        size.currentSize = header.size;
      }
      this.headerSizes.push(size);
    }
    return size;
  }
  private getHeaderElement(header: DatatableHeader): (HTMLElement | null) {
    return this.headerContainers.toArray().find((container: DatatableHeaderContainerComponent) => container.header === header)?.elementRef.nativeElement ?? null;
  }
  setHeaderSizeRelative(header: DatatableHeader, newSizeRelative: number) {
    const hEl = this.getHeaderElement(header);
    this.setHeaderSize(header, (hEl?.getBoundingClientRect().width ?? 0) + newSizeRelative)
  }
  setHeaderSize(header: DatatableHeader, newSize: number) {
    newSize = Math.max(newSize, DatatableComponent.minimumCellSize);
    // Get index of the header in relation to others
    const headerIndex = this.service.getHeaderIndex(header.key);
    if (headerIndex === -1 || !this.isHeaderResizable(header)) { return; }
    // Any header to the left of this one should have its size unchanged: any auto sized header should have its size set
    this.service.headers.slice(0, headerIndex).forEach((h: DatatableHeader) => {
      const size = this.getHeaderSize(h);
      if (size.strategy === 'auto') {
        const element = this.getHeaderElement(h);
        if (element) {
          size.strategy = 'set-changeable';
          size.currentSize = element.getBoundingClientRect().width
        }
      }
    });
    // Set the chosen header's new size while calculating the difference from its previous size
    const prevSize = this.getHeaderElement(header)?.getBoundingClientRect().width ?? 0;
    const chosenHeaderSize = this.getHeaderSize(header);
    chosenHeaderSize.strategy = 'set-changeable';
    chosenHeaderSize.currentSize = newSize;
    this.distributeSizeAmongVisibleHeaders(prevSize - newSize, headerIndex + 1);
    // There should be at least one visible header with an auto sizing strategy. If there are none, set the right most changeable back to auto
    // Non-changeable set sizes cannot be set back to auto, but the edge-case in which all headers are non-changeable is handled in the gridTemplateRecords() getter
    const autoCheck = this.service.headers.reduce((acc, curr) => {
      const size = this.getHeaderSize(curr);
      acc.noAutos = acc.noAutos && size.strategy !== 'auto';
      acc.lastChangeable = size.strategy === 'set-changeable' ? size : acc.lastChangeable;
      return acc;
    }, { noAutos: true, lastChangeable: null as (DatatableHeaderSize | null) });
    if (autoCheck.noAutos && autoCheck.lastChangeable) {
      autoCheck.lastChangeable.strategy = 'auto';
      delete autoCheck.lastChangeable.currentSize;
    }
  }
  private distributeSizeAmongVisibleHeaders(sizeToDistribute: number, startIndex = 0) {
    // A positive sizeToDistribute means available space is getting bigger, a negative one means it's getting smaller
    const prevTotalOccupiedSize = this.service.headers.slice(startIndex).reduce((acc, h: DatatableHeader) => {
      const hSize = this.getHeaderSize(h);
      if (hSize.strategy === 'set-changeable') {
        acc += (hSize.currentSize ?? 0);
      } else if (hSize.strategy === 'auto') {
        acc += (this.getHeaderElement(h)?.getBoundingClientRect().width ?? 0)
      }
      return acc;
    }, 0);
    this.service.headers.slice(startIndex).forEach((h: DatatableHeader) => {
      const hSize = this.getHeaderSize(h);
      if (hSize.strategy === 'set-changeable') {
        const ratioOfOccupiedSpace = (hSize.currentSize ?? 0) / prevTotalOccupiedSize;
        if (hSize.currentSize === undefined) { hSize.currentSize = DatatableComponent.minimumCellSize; }
        hSize.currentSize += (sizeToDistribute * ratioOfOccupiedSpace);
        hSize.currentSize = Math.max(hSize.currentSize, DatatableComponent.minimumCellSize);
      }
    });
  }

  onDividerHeld(held: boolean) {
    this.heldHeaderDivider = held;
    if (!held) {
      this.hoveredHeaderDivider = '';
    }
  }
}
