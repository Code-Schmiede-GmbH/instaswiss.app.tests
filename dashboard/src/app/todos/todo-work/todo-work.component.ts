import { Component, Output, EventEmitter, OnInit, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseModalComponent } from "../../base-modal/base-modal.component";
import { TodoItem } from '../logic/todo-item';
import { ExpandableTodoItemComponent } from './expandable-todo-item/expandable-todo-item.component';
import { TodoService } from '../todo.service';
import { TodoGenerator } from '../logic/todo-generator';

@Component({
  selector: 'app-todo-work',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, BaseModalComponent, ExpandableTodoItemComponent],
  templateUrl: './todo-work.component.html',
  styleUrls: ['./todo-work.component.scss']
})
export class TodoWorkComponent implements OnInit {
  @Output() back = new EventEmitter<void>();
  title = 'Todos bearbeiten';
  todos: { name: string; items?: TodoItem[], generator: TodoGenerator }[] = [];
  loading: WritableSignal<boolean>;

  constructor(private todoService: TodoService) {
    this.loading = this.todoService.loading;
  }

  async ngOnInit() {
    this.loading.set(true);

    const todoGenerators = this.todoService.generators;
    const results: { name: string; items?: TodoItem[], generator: TodoGenerator }[] = [];

    for (const generator of todoGenerators) {
      try {
        const res = await generator.getTodos(true);

        if (Array.isArray(res) && res.length === 0) {
          results.push({ name: generator.name, generator });
        } else if (Array.isArray(res)) {
          results.push({ name: generator.name, items: res.map((n: TodoItem) => ({
            ...n,
            generator: generator,
          })), generator });
        } else {
          results.push({ name: generator.name, items: [{
            name: JSON.stringify(res),
            creator: '',
            wrongValue: '',
            id: '',
            type: '',
            correctValue: '',
            generator: generator,
            canBeCorrected: false,
            reason: '',
            actionText: '',
            isAction: false,
          }], generator });
        }
      } catch (e: any) {
        results.push({ name: generator.name, items: [{
            name: e?.message || e,
            creator: '',
            wrongValue: '',
            id: '',
            type: '',
            correctValue: '',
            generator: generator,
            canBeCorrected: false,
            reason: '',
            actionText: '',
            isAction: false,
          }], generator });
      }
    }

    this.todos = results;
    this.loading.set(false);
  }
} 