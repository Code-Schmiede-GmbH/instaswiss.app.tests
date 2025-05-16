import { Component, signal, OnInit } from '@angular/core';
import { TestResultsService, TestResult } from './test-results.service';
import { MatListModule } from '@angular/material/list';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-test-results',
  imports: [MatListModule, NgClass],
  templateUrl: './test-results.component.html',
  styleUrls: ['./test-results.component.scss'],
  standalone: true,
})
export class TestResultsComponent implements OnInit {
  testResults = signal<TestResult[]>([]);
  loading = signal(true);

  constructor(private testService: TestResultsService) {}

  async ngOnInit() {
    this.loading.set(true);
    this.testResults.set(await this.testService.runAllTests());
    this.loading.set(false);
  }
}
