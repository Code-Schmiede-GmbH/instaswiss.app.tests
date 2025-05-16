import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-test-results-view',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="frosted-glass-container test-results-container">
      <div class="test-results-header">
        <button class="back-btn" (click)="backToDashboard.emit()" aria-label="Zurück">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <h2 class="centered">Testergebnisse</h2>
      </div>
      <div class="test-results-list-wrapper">
        <div class="test-results-list">
          <div *ngIf="testsLoading" class="spinner"></div>
          <ng-container *ngIf="!testsLoading">
            <div *ngFor="let result of testResults; trackBy: trackByName" class="test-result-item" [ngClass]="{passed: result.passed, failed: !result.passed}">
              <div class="result-title">{{ result.name }}</div>
              <div class="result-message">{{ result.message }}</div>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `,
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