import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseModalComponent } from '../base-modal/base-modal.component';

@Component({
  selector: 'app-test-results-view',
  standalone: true,
  imports: [CommonModule, BaseModalComponent],
  templateUrl: './test-results-view.component.html',
  styleUrls: ['./test-results-view.component.scss']
})
export class TestResultsViewComponent {
  @Input() testResults: any[] = [];
  @Input() testsLoading = false;
  @Output() backToDashboard = new EventEmitter<void>();

  trackByName(index: number, item: any) {
    return item.name;
  }
} 