import { Component } from '@angular/core';
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { LoginComponent } from "./components/login/login.component";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-root',
  imports: [DashboardComponent, LoginComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ShoaibExpenses';
}
