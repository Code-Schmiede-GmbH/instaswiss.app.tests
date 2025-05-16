import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BaseModalComponent } from "../../base-modal/base-modal.component";

@Component({
  selector: 'app-todo-work',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, BaseModalComponent],
  templateUrl: './todo-work.component.html',
  styleUrls: ['./todo-work.component.scss']
})
export class TodoWorkComponent {
  @Input() title = 'Todos bearbeiten';
  @Output() back = new EventEmitter<void>();
} 