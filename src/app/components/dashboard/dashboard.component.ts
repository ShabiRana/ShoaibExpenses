import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ExpenseService } from '../../services/expense.service';
import { CommonModule } from '@angular/common';
import { RecordModalComponent } from './RecordModal/RecordModal/RecordModal.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  records: any[] = [];
  totalIncome = 0;
  totalExpense = 0;
  savings = 0;
  savingsPercentage = 0;

  // Chart instances
  private incomeExpenseChart: any;
  private expensePieChart: any;
  private monthlyTrendChart: any;

  constructor(
    private expenseService: ExpenseService, 
    private modalService: NgbModal
  ) {
    Chart.register(...registerables);
  }

  async ngOnInit() {
    await this.loadData();
  }

  ngAfterViewInit() {
    // Charts will be initialized after data is loaded
  }

  async loadData() {
    try {
      this.records = await this.expenseService.getRecords();
      this.calculateTotals();
      this.initializeCharts();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  calculateTotals() {
    this.totalIncome = this.records
      .filter(r => r.type === 'Income')
      .reduce((sum, r) => sum + r.amount, 0);

    this.totalExpense = this.records
      .filter(r => r.type === 'Expense')
      .reduce((sum, r) => sum + r.amount, 0);

    this.savings = this.totalIncome - this.totalExpense;
    this.savingsPercentage = this.totalIncome > 0 ? (this.savings / this.totalIncome) * 100 : 0;
  }

  initializeCharts() {
    // Destroy existing charts before creating new ones
    this.destroyCharts();
    
    // Create new charts
    this.createIncomeExpenseChart();
    this.createExpensePieChart();
    this.createMonthlyTrendChart();
  }

  destroyCharts() {
    if (this.incomeExpenseChart) {
      this.incomeExpenseChart.destroy();
    }
    if (this.expensePieChart) {
      this.expensePieChart.destroy();
    }
    if (this.monthlyTrendChart) {
      this.monthlyTrendChart.destroy();
    }
  }

createIncomeExpenseChart() {
  const ctx = document.getElementById('incomeExpenseChart') as HTMLCanvasElement;
  if (!ctx) return;

  this.incomeExpenseChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Income', 'Expense', 'Savings'],
      datasets: [{
        label: 'Amount (PKR)',
        data: [this.totalIncome, this.totalExpense, this.savings],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Financial Overview'
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const value = context.parsed?.y ?? context.parsed;
              if (value == null) return 'PKR 0';
              
              if (typeof value === 'number') {
                return `PKR ${value.toLocaleString()}`;
              }
              
              return `PKR ${value}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => {
              if (typeof value === 'number') {
                return 'PKR ' + value.toLocaleString();
              }
              return value;
            }
          }
        }
      }
    }
  });
}

createExpensePieChart() {
  const expenseRecords = this.records.filter(record => record.type === 'Expense');
  
  if (expenseRecords.length === 0) {
    this.createEmptyExpenseChart();
    return;
  }

  const expenseByCategory = this.groupExpensesByNote(expenseRecords);
  const ctx = document.getElementById('expensePieChart') as HTMLCanvasElement;
  if (!ctx) return;

  this.expensePieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(expenseByCategory),
      datasets: [{
        data: Object.values(expenseByCategory),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
          '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
          '#FF6384', '#36A2EB'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
        },
        title: {
          display: true,
          text: 'Expense Distribution'
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const value = context.parsed ?? context.raw;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              
              if (value == null || total === 0) {
                return 'PKR 0 (0%)';
              }
              
              const percentage = ((value / total) * 100).toFixed(1);
              return `PKR ${value.toLocaleString()} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}
createEmptyExpenseChart() {
    const ctx = document.getElementById('expensePieChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.expensePieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['No Expenses'],
        datasets: [{
          data: [1],
          backgroundColor: ['#E0E0E0'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          },
          title: {
            display: true,
            text: 'Expense Distribution'
          },
          tooltip: {
            enabled: false
          }
        }
      }
    });
  }
createMonthlyTrendChart() {
  const monthlyData = this.getMonthlyData();
  const ctx = document.getElementById('monthlyTrendChart') as HTMLCanvasElement;
  if (!ctx) return;

  this.monthlyTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthlyData.months,
      datasets: [
        {
          label: 'Income',
          data: monthlyData.income,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Expense',
          data: monthlyData.expense,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Monthly Income vs Expense Trend'
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const value = context.parsed?.y ?? context.raw;
              if (value == null) {
                return `${context.dataset.label}: PKR 0`;
              }
              
              if (typeof value === 'number') {
                return `${context.dataset.label}: PKR ${value.toLocaleString()}`;
              }
              
              return `${context.dataset.label}: PKR ${value}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => {
              if (typeof value === 'number') {
                return 'PKR ' + value.toLocaleString();
              }
              return value;
            }
          }
        }
      }
    }
  });
}
  groupExpensesByNote(expenseRecords: any[]): { [key: string]: number } {
    const grouped: { [key: string]: number } = {};
    
    expenseRecords.forEach(record => {
      const category = record.note && record.note.trim() !== '' ? record.note : 'Uncategorized';
      if (grouped[category]) {
        grouped[category] += record.amount;
      } else {
        grouped[category] = record.amount;
      }
    });
    
    return grouped;
  }

  getMonthlyData() {
    const monthlyData: { [key: string]: { income: number, expense: number } } = {};
    
    this.records.forEach(record => {
      try {
        const date = new Date(record.date);
        if (isNaN(date.getTime())) {
          console.warn('Invalid date:', record.date);
          return;
        }
        
        const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { income: 0, expense: 0 };
        }
        
        if (record.type === 'Income') {
          monthlyData[monthYear].income += record.amount;
        } else if (record.type === 'Expense') {
          monthlyData[monthYear].expense += record.amount;
        }
      } catch (error) {
        console.error('Error processing record:', record, error);
      }
    });
    
    const months = Object.keys(monthlyData).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });
    
    const income = months.map(month => monthlyData[month].income);
    const expense = months.map(month => monthlyData[month].expense);
    
    return { months, income, expense };
  }

  addNewRecord() {
    const modalRef = this.modalService.open(RecordModalComponent, {
      size: 'xl',
      backdrop: 'static',
      scrollable: true,
      centered: true
    });

    modalRef.componentInstance.record = null; // new record

    modalRef.componentInstance.onSave.subscribe(async (record: any) => {
      try {
        await this.expenseService.addRecord(record);
        await this.loadData(); // reload table and charts
        modalRef.close();
      } catch (error) {
        console.error('Error adding record:', error);
      }
    });

    modalRef.componentInstance.onClose.subscribe(() => modalRef.close());
  }

  editRecord(record: any) {
    const modalRef = this.modalService.open(RecordModalComponent, {
      size: 'xl',
      backdrop: 'static',
      scrollable: true,
      centered: true
    });

    modalRef.componentInstance.record = { ...record }; // pass existing data

    modalRef.componentInstance.onSave.subscribe(async (updatedRecord: any) => {
      try {
        // Include id to update correct row
        await this.expenseService.updateRecord({ ...record, ...updatedRecord });
        await this.loadData(); // reload table and charts
        modalRef.close();
      } catch (error) {
        console.error('Error updating record:', error);
      }
    });

    modalRef.componentInstance.onClose.subscribe(() => modalRef.close());
  }

  async deleteRecord(record: any) {
    if (confirm(`Are you sure you want to delete this ${record.type} record?`)) {
      try {
        await this.expenseService.deleteRecord(record.id);
        await this.loadData(); // reload table and charts
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  }

  // Clean up charts when component is destroyed
  ngOnDestroy() {
    this.destroyCharts();
  }
}