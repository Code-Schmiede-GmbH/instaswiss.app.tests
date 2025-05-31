import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseModalComponent } from "../../base-modal/base-modal.component";
import { TodoItem } from '../logic/todo-item';
import { ExpandableTodoItemComponent } from './expandable-todo-item/expandable-todo-item.component';
import { PhoneNumberFormatTodoGenerator } from '../logic/phone-number-format-todo';
import { WebcamUrlImageTodoGenerator } from '../logic/webcam-url-image-todo';
import { SvgMapTodo } from '../logic/svgmap-todo';

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
  todos: { name: string; items?: TodoItem[] }[] = [];
  loading = true;

  async ngOnInit() {
    this.loading = true;
    const todoGenerators = [
      new PhoneNumberFormatTodoGenerator(),
      new WebcamUrlImageTodoGenerator(),
      new SvgMapTodo(),
    ];
    const results: { name: string; items?: TodoItem[] }[] = [];
    for (const generator of todoGenerators) {
      try {
        const res = await generator.getTodos();

        if (Array.isArray(res) && res.length === 0) {
          results.push({ name: generator.name });
        } else if (Array.isArray(res)) {
          results.push({ name: generator.name, items: res.map((n: TodoItem) => ({
            name: n.name,
            wrongValue: n.wrongValue,
            id: n.id,
            type: n.type,
            correctValue: n.correctValue,
            generator: generator,
            canBeCorrected: n.canBeCorrected,
            reason: n.reason,
            actionText: n.actionText,
          })) });
        } else {
          results.push({ name: generator.name, items: [{
            name: JSON.stringify(res),
            wrongValue: '',
            id: '',
            type: '',
            correctValue: '',
            generator: generator,
            canBeCorrected: false,
            reason: '',
            actionText: '',
          }] });
        }
      } catch (e: any) {
        results.push({ name: generator.name, items: [{
            name: e?.message || e,
            wrongValue: '',
            id: '',
            type: '',
            correctValue: '',
            generator: generator,
            canBeCorrected: false,
            reason: '',
            actionText: '',
          }] });
      }
    }
    this.todos = results;
    this.loading = false;
  }
} 