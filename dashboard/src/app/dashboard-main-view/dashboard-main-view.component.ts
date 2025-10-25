import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TodoListComponent } from '../todos/todo-list/todo-list.component';
import { TodoWorkComponent } from '../todos/todo-work/todo-work.component';
import { SubscriptionStatsComponent } from './subscription-stats/subscription-stats.component';
import { HikeWithCreator } from '../tests/logic/test-utils';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-dashboard-main-view',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    DatePipe,
    TodoListComponent,
    TodoWorkComponent,
    SubscriptionStatsComponent,
  ],
  templateUrl: './dashboard-main-view.component.html',
  styleUrls: ['./dashboard-main-view.component.scss'],
  animations: [
    trigger('flyInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      transition('void => *', [
        style({ transform: 'translateX(-100%)' }),
        animate(300),
      ]),
      transition('* => void', [
        animate(300, style({ transform: 'translateX(100%)' })),
      ]),
    ]),
  ],
})
export class DashboardMainViewComponent {
  private _hikes: HikeWithCreator[] = [];
  @Input()
  get hikes(): HikeWithCreator[] {
    return this._hikes;
  }
  set hikes(value: HikeWithCreator[]) {
    this._hikes = value;
  }

  @Input() totalHikeCount: number = 0;
  @Output() runTests = new EventEmitter<void>();
  @Output() removeApiKey = new EventEmitter<void>();
  @Output() workViewRequested = new EventEmitter<void>();

  showWorkView = false;
  showAllHikes = false;
  maxVisibleHikes = 5;

  get sortedHikes(): HikeWithCreator[] {
    return this.hikes.sort((a, b) => {
      const aDate = new Date(a.date_created);
      const bDate = new Date(b.date_created);
      return bDate.getTime() - aDate.getTime();
    });
  }

  get displayedHikes(): HikeWithCreator[] {
    const sorted = this.sortedHikes;
    if (this.showAllHikes || sorted.length <= this.maxVisibleHikes) {
      return sorted;
    }
    return sorted.slice(0, this.maxVisibleHikes);
  }

  onWorkViewRequested() {
    this.workViewRequested.emit();
  }

  onWorkViewBack() {
    this.showWorkView = false;
  }

  toggleHikeList() {
    this.showAllHikes = !this.showAllHikes;
  }
}
