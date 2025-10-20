import { Injectable } from '@angular/core';
import { DualStorageService } from './dual-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  constructor(private dualStorage: DualStorageService) {}

  async login(credentials: { username: string; password: string }): Promise<boolean> {
    try {
      const result = await this.dualStorage.loginUser(credentials);
      return result.success;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
  }
}