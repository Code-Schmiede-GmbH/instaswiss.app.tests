import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { checkAccomodationPhoneNumbers } from '../logic/phone-number-format-todo';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';

interface TodoResult {
  name: string;
  loading: boolean;
  result?: string;
  error?: string;
}

interface TodoExecutor {
  name: string;
  execute: () => Promise<any>;
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
    const todos: TodoExecutor[] = [
      {
        name: 'Telefonnummer korrigieren',
        execute: async () => {
          return checkAccomodationPhoneNumbers();
        }
      },
      // Add more todos here
    ];
    const results: TodoResult[] = todos.map(t => ({ name: t.name, loading: true }));
    this.todos.set(results);
    this.loading.set(true);
    for (let i = 0; i < todos.length; ++i) {
      try {
        const res = await todos[i].execute();
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