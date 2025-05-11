import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
    selector: 'tmk-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss'],
    standalone: false
})
export class IndexComponent {
  radialGradientCentreX = 0;
  radialGradientCentreY = 0;

  @ViewChild('signatureLogo')
  private signatureLogo: ElementRef | null = null;

  @HostListener('window:mousemove', ['$event'])
  private onMouseMove(event: MouseEvent) {
    const rect = this.signatureLogo.nativeElement?.getBoundingClientRect();
    if (rect) {
      this.radialGradientCentreX = (event.clientX - rect.x) / rect.width * 100;
      this.radialGradientCentreY = (event.clientY - rect.y) / rect.height * 100;
      // this.radialGradientCentreX = Math.max(Math.min(this.radialGradientCentreX, 100), 0);
      // this.radialGradientCentreY = Math.max(Math.min(this.radialGradientCentreY, 100), 0);
    } else {
      this.radialGradientCentreX = 50;
      this.radialGradientCentreY = 50;
    }
  }
}
