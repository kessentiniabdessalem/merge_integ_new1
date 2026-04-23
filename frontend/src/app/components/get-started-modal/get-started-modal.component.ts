import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

declare const bootstrap: any;

@Component({
  selector: 'app-get-started-modal',
  templateUrl: './get-started-modal.component.html',
  styleUrl: './get-started-modal.component.scss',
  standalone: false,
})
export class GetStartedModalComponent implements AfterViewInit {
  @ViewChild('modalEl') modalEl!: ElementRef<HTMLDivElement>;
  private modalInstance: any;

  ngAfterViewInit(): void {
    if (this.modalEl?.nativeElement && typeof bootstrap !== 'undefined') {
      this.modalInstance = bootstrap.Modal.getOrCreateInstance(this.modalEl.nativeElement);
    }
  }

  open(): void {
    this.modalInstance?.show();
  }
}
