import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private isElectron = !!(window && (window as any).electronAPI);

  async login(credentials: { username: string; password: string }): Promise<boolean> {
    // Debugging
    console.log('Electron API available:', this.isElectron);
    
    if (!this.isElectron) {
      console.warn('Running in browser mode - using mock login');
      // Temporary mock login for testing
      return credentials.username === 'admin' && credentials.password === '1234';
    }

    try {
      const result = await (window as any).electronAPI.loginUser(credentials);
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