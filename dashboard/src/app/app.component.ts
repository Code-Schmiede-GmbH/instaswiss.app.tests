import { Component, signal } from '@angular/core';
import { NgClass } from '@angular/common';
// @ts-ignore
import { createClient } from '@supabase/supabase-js';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TestResultsService } from './test-results.service';
import { fetchHikes, SUPABASE_URL } from './tests/test-utils';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ApiKeyInputComponent } from './api-key-input/api-key-input.component';
import { DashboardMainViewComponent } from './dashboard-main-view/dashboard-main-view.component';
import { TestResultsViewComponent } from './test-results-view/test-results-view.component';

@Component({
  selector: 'app-root',
  imports: [
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatExpansionModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgClass,
    ApiKeyInputComponent,
    DashboardMainViewComponent,
    TestResultsViewComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    trigger('dashboardSlide', [
      state('visible', style({ transform: 'translateY(0)', opacity: 1 })),
      state('hidden', style({ transform: 'translateY(-120%)', opacity: 0 })),
      transition('visible => hidden', [
        animate('600ms cubic-bezier(0.77,0,0.175,1)')
      ]),
      transition('hidden => visible', [
        animate('400ms cubic-bezier(0.77,0,0.175,1)')
      ]),
    ]),
    trigger('testResultsFade', [
      state('hidden', style({ opacity: 0, transform: 'scale(0.95) translateY(40px)' })),
      state('visible', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
      transition('hidden => visible', [
        animate('500ms 100ms cubic-bezier(0.77,0,0.175,1)')
      ]),
      transition('visible => hidden', [
        animate('300ms cubic-bezier(0.77,0,0.175,1)')
      ]),
    ]),
  ],
})
export class AppComponent {
  hikeCount = signal<number | null>(null);
  apiKey = signal<string>('');
  inputApiKey = signal<string>('');
  testResults = signal<any[]>([]);
  testsLoading = signal(false);
  testsStarted = signal(false);

  constructor(private testResultsService: TestResultsService) {
    const storedKey = localStorage.getItem('apiKey') || '';
    this.apiKey.set(storedKey);
    this.inputApiKey.set(storedKey);
    this.fetchHikeCount();
  }

  handleApiKeySaved(key: string) {
    this.apiKey.set(key);
    localStorage.setItem('apiKey', key);
    this.inputApiKey.set(key);
    this.fetchHikeCount();
  }

  clearApiKey() {
    localStorage.removeItem('apiKey');
    this.apiKey.set('');
    this.inputApiKey.set('');
    this.hikeCount.set(null);
  }

  async fetchHikeCount() {
    if (!this.apiKey()) {
      this.hikeCount.set(null);
      return;
    }
    try {
      const hikes = await fetchHikes(SUPABASE_URL, this.apiKey());
      this.hikeCount.set(Array.isArray(hikes) ? hikes.length : 0);
    } catch (e) {
      this.hikeCount.set(0);
    }
  }

  async runTests() {
    this.testsStarted.set(true);
    this.testsLoading.set(true);
    const results = await this.testResultsService.runAllTests();
    this.testResults.set(results);
    this.testsLoading.set(false);
  }

  backToDashboard() {
    this.testsStarted.set(false);
    this.testResults.set([]);
  }
}
