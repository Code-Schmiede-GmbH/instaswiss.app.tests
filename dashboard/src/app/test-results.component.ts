import { Component, signal } from '@angular/core';
import { TestResultsService, TestResult } from './test-results.service';
import { MatListModule } from '@angular/material/list';
import { NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-test-results',
  imports: [MatListModule, NgClass, MatButtonModule],
  templateUrl: './test-results.component.html',
  styleUrls: ['./test-results.component.scss'],
  standalone: true,
})
export class TestResultsComponent {
  testResults = signal<TestResult[]>([]);
  loading = signal(false);

  constructor(private testService: TestResultsService) {}

  async runTests() {
    this.loading.set(true);
    this.testResults.set(await this.testService.runAllTests());
    this.loading.set(false);
  }
}
