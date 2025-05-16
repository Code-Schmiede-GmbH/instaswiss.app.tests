import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-api-key-input',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule],
  template: `
    <mat-card class="login-card">
      <mat-card-title>API-Schlüssel eingeben</mat-card-title>
      <mat-card-content>
        <form (ngSubmit)="onSubmit()" #apiKeyForm="ngForm" style="display: flex; flex-direction: column; gap: 16px">
          <mat-form-field appearance="fill">
            <mat-label>API-Schlüssel</mat-label>
            <input matInput type="text" name="apiKey" [(ngModel)]="inputApiKey" required autocomplete="off" />
          </mat-form-field>
          <button mat-raised-button color="primary" type="submit" [disabled]="!inputApiKey">
            Speichern
          </button>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styleUrls: ['./api-key-input.component.scss']
})
export class ApiKeyInputComponent {
  inputApiKey = '';
  @Output() apiKeySaved = new EventEmitter<string>();

  onSubmit() {
    this.apiKeySaved.emit(this.inputApiKey);
  }
} 