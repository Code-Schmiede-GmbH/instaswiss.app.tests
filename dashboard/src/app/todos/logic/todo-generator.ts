import type { TodoItem } from './todo-item';


export interface TodoGenerator {
  readonly name: string;
  getTodos(cached: boolean): Promise<TodoItem[]>;
  fixTodo(id: string, correctValue: string): Promise<void>;
}
