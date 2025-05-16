import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard-main-view',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './dashboard-main-view.component.html',
  styleUrls: ['./dashboard-main-view.component.scss']
})
export class DashboardMainViewComponent {
  @Input() hikeCount: number | null = null;
  @Output() runTests = new EventEmitter<void>();
  @Output() removeApiKey = new EventEmitter<void>();
} 