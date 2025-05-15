import { Component, signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { NgClass } from '@angular/common';

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

@Component({
  selector: 'app-test-results',
  imports: [MatListModule, NgClass],
  templateUrl: './test-results.component.html',
  styleUrls: ['./test-results.component.scss']
})
export class TestResultsComponent {
  testResults = signal<TestResult[]>([
    { name: 'Filter by difficulty', passed: true },
    { name: 'Filter by min/max length', passed: false, message: 'Returned hikes outside range' },
    { name: 'Filter by elevation gain', passed: true },
    { name: 'Multiple filter params', passed: true },
    { name: 'Invalid query params', passed: true },
    { name: 'Unauthorized access', passed: false, message: 'Did not return 401' }
  ]);
}
