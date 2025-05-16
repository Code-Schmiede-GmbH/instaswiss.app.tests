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
  templateUrl: './api-key-input.component.html',
  styleUrls: ['./api-key-input.component.scss']
})
export class ApiKeyInputComponent {
  inputApiKey = '';
  @Output() apiKeySaved = new EventEmitter<string>();
  @Output() apiKeyRemoved = new EventEmitter<void>();

  onSubmit() {
    this.apiKeySaved.emit(this.inputApiKey);
  }

  onRemove() {
    this.apiKeyRemoved.emit();
  }
} 