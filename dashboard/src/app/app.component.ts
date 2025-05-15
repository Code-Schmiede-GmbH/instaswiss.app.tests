import { Component, signal } from '@angular/core';
// @ts-ignore
import { createClient } from '@supabase/supabase-js';
import { TodoListComponent } from './todo-list.component';
import { TestResultsComponent } from './test-results.component';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

const SUPABASE_URL = 'https://fiuchvggmjsegklpsgaq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpdWNodmdnbWpzZWdrbHBzZ2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc0MTk3ODAsImV4cCI6MjAzMjk5NTc4MH0.92i8SOaqvzGz6Ao1bV_OF8O8RD9Hkj14MZOA64q3csQ';

@Component({
  selector: 'app-root',
  imports: [MatCardModule, MatListModule, MatButtonModule, MatExpansionModule, TodoListComponent, TestResultsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  hikeCount = signal<number | null>(null);

  constructor() {
    this.fetchHikeCount();
  }

  async fetchHikeCount() {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data, error } = await supabase.from('hikes').select('id');
      if (error) throw error;
      this.hikeCount.set(Array.isArray(data) ? data.length : 0);
    } catch (e) {
      this.hikeCount.set(0);
    }
  }
}
