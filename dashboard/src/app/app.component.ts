import { Component, signal } from '@angular/core';
import { NgClass } from '@angular/common';
// @ts-ignore
import { createClient } from '@supabase/supabase-js';
import { TodoListComponent } from './todo-list.component';
import { TestResultsComponent } from './test-results.component';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { LoginComponent } from './login.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TestResultsService } from './test-results.service';

const SUPABASE_URL = 'https://fiuchvggmjsegklpsgaq.supabase.co';

@Component({
  selector: 'app-root',
  imports: [
    MatCardModule,
    MatListModule,
    MatButtonModule,
    MatExpansionModule,
    TodoListComponent,
    TestResultsComponent,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgClass,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  hikeCount = signal<number | null>(null);
  apiKey = signal<string>('');
  inputApiKey = signal<string>('');
  testResults = signal<any[]>([]);
  testsLoading = signal(false);

  constructor(private testResultsService: TestResultsService) {
    const storedKey = localStorage.getItem('apiKey') || '';
    this.apiKey.set(storedKey);
    this.inputApiKey.set(storedKey);
    this.fetchHikeCount();
  }

  saveApiKey() {
    this.apiKey.set(this.inputApiKey());
    localStorage.setItem('apiKey', this.apiKey());
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
      const supabase = createClient(SUPABASE_URL, this.apiKey());
      const { data, error } = await supabase.from('hikes').select('id');
      if (error) throw error;
      this.hikeCount.set(Array.isArray(data) ? data.length : 0);
    } catch (e) {
      this.hikeCount.set(0);
    }
  }

  async runTests() {
    this.testsLoading.set(true);
    const results = await this.testResultsService.runAllTests();
    this.testResults.set(results);
    this.testsLoading.set(false);
  }
}
