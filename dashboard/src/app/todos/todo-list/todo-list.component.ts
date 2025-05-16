import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';
import { WebcamUrlImageTodoGenerator } from '../logic/webcam-url-image-todo';
import { PhoneNumberFormatTodoGenerator } from '../logic/phone-number-format-todo';

interface TodoResult {
  name: string;
  loading: boolean;
  result?: string;
  error?: string;
}

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
  animations: [
    trigger('flyInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('400ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('400ms cubic-bezier(.35,0,.25,1)', style({ transform: 'translateX(-100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class TodoListComponent {
  todos = signal<TodoResult[]>([]);
  loading = signal(true);

  @Output() workViewRequested = new EventEmitter<void>();

  constructor() {
    this.loadTodos();
  }

  async loadTodos() {
    const todoGenerators = [
      new PhoneNumberFormatTodoGenerator(),
      new WebcamUrlImageTodoGenerator(),
      // Add more generators here
    ];
    const results: TodoResult[] = todoGenerators.map(g => ({ name: g.name, loading: true }));
    this.todos.set(results);
    this.loading.set(true);
    for (let i = 0; i < todoGenerators.length; ++i) {
      try {
        const res = await todoGenerators[i].getTodos();
        const newResults = [...this.todos()];
        if (Array.isArray(res) && res.length === 0) {
          newResults[i] = { ...newResults[i], loading: false, result: 'Keine Fehler' };
        } else {
          newResults[i] = { ...newResults[i], loading: false, error: JSON.stringify(res) };
        }
        this.todos.set(newResults);
      } catch (e: any) {
        const newResults = [...this.todos()];
        newResults[i] = { ...newResults[i], loading: false, error: e?.message || e };
        this.todos.set(newResults);
      }
    }
    this.loading.set(false);
  }

  workOnTodos() {
    this.workViewRequested.emit();
    console.log('Work on all todos:', this.todos());
  }
} 