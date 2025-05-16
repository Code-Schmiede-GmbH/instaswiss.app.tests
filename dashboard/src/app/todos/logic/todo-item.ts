import { TodoGenerator } from "./todo-generator";

export interface TodoItem {
  id: string;
  name: string;
  type: string;
  wrongValue: string;
  correctValue: string;
  generator: TodoGenerator;
}
