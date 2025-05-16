import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TodoItem } from '../../logic/todo-item';

@Component({
  selector: 'app-expandable-todo-item',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './expandable-todo-item.component.html',
  styleUrls: ['./expandable-todo-item.component.scss']
})
export class ExpandableTodoItemComponent {
  @Input() todo!: { name: string; items?: TodoItem[] };
  expanded = false;

  toggleExpand() {
    if (this.todo.items?.length) {
      this.expanded = !this.expanded;
    }
  }

  saveFix(item: TodoItem) {
    item.generator.fixTodo(item.id, item.correctValue);
  }

  updateCorrectValue(item: TodoItem, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    item.correctValue = inputElement.value;
  }

  setInputActive(input: HTMLInputElement, active: boolean) {
    input.style.borderBottomColor = active ? '#3f51b5' : '#c4c4c4';
  }
} 