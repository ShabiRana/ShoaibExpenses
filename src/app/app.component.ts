import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { ExpenseService } from './services/expense.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ShoaibExpenses';
  isInitialized = false;
  initializationError = '';

  constructor(private expenseService: ExpenseService) {}

  async ngOnInit() {
    try {
      console.log('🚀 Starting app initialization...');
      await this.expenseService.init();
      this.isInitialized = true;
      console.log('✅ App initialized successfully');
    } catch (error: any) {
      console.error('❌ App initialization failed:', error);
      this.initializationError = error.message || 'Unknown error occurred';
      this.isInitialized = true; // Still show app even if initialization fails
    }
  }
}