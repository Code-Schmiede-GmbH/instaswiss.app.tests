import { TodoGenerator } from "./todo-generator";

export interface TodoItem {
  id: string;
  name: string;
  type: string;
  wrongValue: string;
  canBeCorrected: boolean;
  reason: string;
  correctValue: string;
  isAction: boolean;
  generator: TodoGenerator;
  actionText: string;
}
