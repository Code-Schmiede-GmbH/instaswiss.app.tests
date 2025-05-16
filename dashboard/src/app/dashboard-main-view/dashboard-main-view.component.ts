import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TodoListComponent } from '../todos/todo-list/todo-list.component';
import { TodoWorkComponent } from '../todos/todo-work/todo-work.component';

@Component({
  selector: 'app-dashboard-main-view',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, TodoListComponent, TodoWorkComponent],
  templateUrl: './dashboard-main-view.component.html',
  styleUrls: ['./dashboard-main-view.component.scss']
})
export class DashboardMainViewComponent {
  @Input() hikeCount: number | null = null;
  @Output() runTests = new EventEmitter<void>();
  @Output() removeApiKey = new EventEmitter<void>();
  @Output() workViewRequested = new EventEmitter<void>();

  showWorkView = false;

  onWorkViewRequested() {
    this.workViewRequested.emit();
  }

  onWorkViewBack() {
    this.showWorkView = false;
  }
} 