import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-dashboard-main-view',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, NgClass],
  template: `
    <div class="dashboard-main-container">
      <div class="frosted-glass-container">
        <div class="dashboard-header">
          <h1>Dashboard InstaSwiss</h1>
          <div class="subtitle">API-Schlüssel gespeichert</div>
        </div>
        <div class="dashboard-content">
          <div class="dashboard-card">
            <div class="card-title">Anzahl Wanderungen</div>
            <div class="hike-count">{{ hikeCount === null ? 'Lädt...' : hikeCount }}</div>
          </div>
          <div class="dashboard-card">
            <div class="card-title">To-Dos</div>
            <ul class="todo-list">
              <li>Telefonnummer korrigieren</li>
              <li>Öffnungszeiten-Format korrigieren</li>
              <li>Webcam-Bild-URL korrigieren</li>
            </ul>
          </div>
        </div>
        <button class="run-tests-btn" (click)="runTests.emit()">Tests ausführen</button>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard-main-view.component.scss']
})
export class DashboardMainViewComponent {
  @Input() hikeCount: number | null = null;
  @Output() runTests = new EventEmitter<void>();
} 