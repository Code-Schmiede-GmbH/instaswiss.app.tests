import { Component, signal } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

interface Todo {
  id: number;
  type: 'telephone' | 'opening_hours' | 'webcam_url';
  title: string;
  description: string;
  expanded: boolean;
}

@Component({
  selector: 'app-todo-list',
  imports: [MatListModule, MatButtonModule, MatExpansionModule],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
})
export class TodoListComponent {
  todos = signal<Todo[]>([
    {
      id: 1,
      type: 'telephone',
      title: 'Correct Telephone Number',
      description: 'Check and correct the telephone number for hike #42.',
      expanded: false,
    },
    {
      id: 2,
      type: 'opening_hours',
      title: 'Correct Opening Hours Format',
      description:
        'Ensure opening hours for hike #17 are in the correct format (e.g. Mo-Fr 09:00-18:00).',
      expanded: false,
    },
    {
      id: 3,
      type: 'webcam_url',
      title: 'Correct Webcam Image URL',
      description:
        'Update the webcam image URL for hike #99 to a valid image link.',
      expanded: false,
    },
  ]);

  toggleExpand(todo: Todo) {
    this.todos.update((list) =>
      list.map((t) => (t.id === todo.id ? { ...t, expanded: !t.expanded } : t)),
    );
  }
}
