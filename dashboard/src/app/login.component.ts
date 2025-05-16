import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fiuchvggmjsegklpsgaq.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpdWNodmdnbWpzZWdrbHBzZ2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc0MTk3ODAsImV4cCI6MjAzMjk5NTc4MH0.92i8SOaqvzGz6A';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error: string | null = null;

  constructor(private router: Router) {}

  async login() {
    this.loading = true;
    this.error = null;
    const { error } = await supabase.auth.signInWithPassword({
      email: this.email,
      password: this.password,
    });
    this.loading = false;
    if (error) {
      this.error = error.message;
    } else {
      this.router.navigate(['/']);
    }
  }
}
