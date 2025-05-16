import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-base-modal',
  standalone: true,
  templateUrl: './base-modal.component.html',
  styleUrls: ['./base-modal.component.scss']
})
export class BaseModalComponent {
  @Input() title = '';
  @Output() back = new EventEmitter<void>();
} 