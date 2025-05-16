import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-test-results-view',
  standalone: true,
  imports: [CommonModule],
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