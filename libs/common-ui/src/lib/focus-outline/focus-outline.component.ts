import { AfterViewInit, Component, HostBinding, OnDestroy, ViewEncapsulation } from '@angular/core';
import { interval, Subject, takeUntil } from 'rxjs';

interface FocusOutlineComponentOptions {
  width: number;
  height: number;
  lineWidth: number;
  margin?: number;
  variation?: number;
  colours?: string[];
}

@Component({
  selector: 'tmk-focus-outline',
  templateUrl: './focus-outline.component.html',
  styleUrls: ['./focus-outline.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FocusOutlineComponent implements AfterViewInit, OnDestroy {
  @HostBinding('class.tmk-focus-outline') private className = true;

  width = 100;
  height = 100;
  lineWidth = 6;
  margin = 4;
  variation = 4;
  colours = [
    'hsla(200,80%,70%,0.8)',
    'hsla(200,80%,70%,0.4)',
    'hsla(200,80%,70%,0.8)'
  ];

  currentGradientAngle = 0;
  private currentMarginVariation = 0;
  private destroyed$ = new Subject<boolean>();

  get path(): string {
    const a = (this.margin + this.currentMarginVariation / 2) + this.lineWidth; // Distance between element and outside of outline
    const b = (this.margin + this.currentMarginVariation / 2); // Distance between element and inside of outline
    return `
      M 0 -${a}
      h 100
      q ${a} 0 ${a} ${a}
      v 100
      q 0 ${a} -${a} ${a}
      h -100
      q -${a} 0 -${a} -${a}
      v -100q0 -${a} ${a} -${a}
      z
      M 0 -${b}
      h 100
      q ${b} 0 ${b} ${b}
      v 100
      q 0 ${b} -${b} ${b}
      h -100
      q -${b} 0 -${b} -${b}
      v -100
      q 0 -${b} ${b} -${b}
      z
    `;
  }

  ngAfterViewInit() {
    interval(50).pipe(takeUntil(this.destroyed$)).subscribe(() => {
      const d = +(new Date());
      this.currentMarginVariation = Math.sin(((d % 1000 - 500) / 500) * Math.PI) * this.variation;
      this.currentGradientAngle = Math.floor((d % 1000) / 1000 * 360)
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
