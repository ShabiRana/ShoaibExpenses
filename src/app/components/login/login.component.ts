import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/login.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
   imports: [CommonModule, FormsModule],
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onLogin() {
const isValid = await this.authService.login({
  username: this.username,
  password: this.password
});    if (isValid) {
      localStorage.setItem('isLoggedIn', 'true');
      this.router.navigate(['/dashboard']); // ✅ redirect to dashboard
    } else {
      this.errorMessage = 'Invalid username or password';
    }
  }
}
