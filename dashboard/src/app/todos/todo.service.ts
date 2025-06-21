import { Injectable, signal } from '@angular/core';
import { WebcamUrlImageTodoGenerator } from './logic/webcam-url-image-todo';
import { PhoneNumberFormatTodoGenerator } from './logic/phone-number-format-todo';
import { SvgMapTodo } from './logic/svgmap-todo';
import { GpxFileTodoGenerator } from './logic/gpx-file-todo';
import { TodoGenerator } from './logic/todo-generator';

export interface TodoResult {
  name: string;
  loading: boolean;
  result?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  todos = signal<TodoResult[]>([]);
  loading = signal(true);

  public generators: TodoGenerator[] = [
    new PhoneNumberFormatTodoGenerator(),
    new WebcamUrlImageTodoGenerator(),
    new SvgMapTodo(),
    new GpxFileTodoGenerator(),
  ];

  constructor() {
    this.loadTodos();
  }

  async loadTodos() {
    const todoGenerators = this.generators;
    const results: TodoResult[] = todoGenerators.map(g => ({ name: g.name, loading: true }));

    this.todos.set(results);
    this.loading.set(true);
    
    for (let i = 0; i < todoGenerators.length; ++i) {
      try {
        const res = await todoGenerators[i].getTodos(false);
        const newResults = [...this.todos()];

        if (Array.isArray(res) && res.length === 0) {
          newResults[i] = { ...newResults[i], loading: false, result: 'Keine Fehler' };
        } else {
          newResults[i] = { ...newResults[i], loading: false, error: `${res.length} Fehler gefunden` };
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
}