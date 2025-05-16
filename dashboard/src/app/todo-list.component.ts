import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TodoResult {
  name: string;
  loading: boolean;
  result?: string;
  error?: string;
}

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-title">To-Dos</div>
    <ul class="todo-list">
      <li *ngIf="loading()">Lädt To-Dos...</li>
      <li *ngFor="let todo of todos(); trackBy: trackByName">
        <span>{{ todo.name }}:</span>
        <span *ngIf="todo.loading">(läuft...)</span>
        <span *ngIf="todo.error" style="color: #e74c3c">Fehler: {{ todo.error }}</span>
        <span *ngIf="todo.result && !todo.error" style="color: #27ae60">OK: {{ todo.result }}</span>
      </li>
    </ul>
    <style>
      .todo-list { list-style: disc inside; font-size: 1.1rem; color: #222; padding: 0; margin: 0; text-align: left; }
    </style>
  `
})
export class TodoListComponent {
  todos = signal<TodoResult[]>([]);
  loading = signal(true);

  constructor() {
    this.loadTodos();
  }

  async loadTodos() {
    // List of todo modules to import (add more as you add files)
    const todoModules = [
      import('./todos/phone-number-format-todo'),
      // Add more: import('./todos/other-todo'),
    ];
    const todoFns = [
      { name: 'Telefonnummer korrigieren', fnName: 'checkAccomodationPhoneNumbers' },
      // Add more: { name: '...', fnName: '...' },
    ];
    const results: TodoResult[] = todoFns.map(t => ({ name: t.name, loading: true }));
    this.todos.set(results);
    this.loading.set(true);
    for (let i = 0; i < todoModules.length; ++i) {
      try {
        const mod = await todoModules[i];
        const fn = (mod as any)[todoFns[i].fnName];
        if (typeof fn === 'function') {
          const res = await fn();
          const newResults = [...this.todos()];
          newResults[i] = { ...newResults[i], loading: false, result: Array.isArray(res) && res.length === 0 ? 'Keine Fehler' : JSON.stringify(res) };
          this.todos.set(newResults);
        } else {
          const newResults = [...this.todos()];
          newResults[i] = { ...newResults[i], loading: false, error: 'Funktion nicht gefunden' };
          this.todos.set(newResults);
        }
      } catch (e: any) {
        const newResults = [...this.todos()];
        newResults[i] = { ...newResults[i], loading: false, error: e?.message || e };
        this.todos.set(newResults);
      }
    }
    this.loading.set(false);
  }

  trackByName(index: number, item: TodoResult) {
    return item.name;
  }
} 