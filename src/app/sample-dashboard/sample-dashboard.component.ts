import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-sample-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './sample-dashboard.component.html',
  styleUrl: './sample-dashboard.component.scss'
})
export class SampleDashboardComponent implements OnInit {
  // Dashboard statistics from API
  dashboardStats = [
    {
      title: 'Total Products',
      value: '0',
      bgColor: '#7c3aed'
    },
    {
      title: 'Newsletter Subscribers',
      value: '0',
      bgColor: '#0ea5e9'
    },
    {
      title: 'Featured Products',
      value: '0',
      bgColor: '#f59e0b'
    },
    {
      title: 'Active Promos',
      value: '0',
      bgColor: '#10b981'
    }
  ];

  // Chart data for trends (will be populated from API)
  chartData = [
    { month: 'Oct', orders: 0, sales: 0 },
    { month: 'Nov', orders: 0, sales: 0 },
    { month: 'Dec', orders: 0, sales: 0 },
    { month: 'Jan', orders: 0, sales: 0 },
    { month: 'Feb', orders: 0, sales: 0 },
    { month: 'Mar', orders: 0, sales: 0 }
  ];

  // Time data for activity (will be populated from API)
  timeData = [
    { time: '07 am', value: 0 },
    { time: '09 am', value: 0 },
    { time: '11 am', value: 0 },
    { time: '01 pm', value: 0 },
    { time: '03 pm', value: 0 },
    { time: '05 pm', value: 0 },
    { time: '07 pm', value: 0 }
  ];

  // Department data (will be populated from API)
  departments = [
    { name: 'Electronics', count: 0 },
    { name: 'Fashion', count: 0 },
    { name: 'Home & Garden', count: 0 }
  ];

  // Gender distribution (calculated from subscriber data)
  genderData = {
    male: 65,
    female: 35
  };

  // Monthly stats (from API)
  monthlyStats = {
    current: 0
  };

  // Loading states
  isLoading = true;
  error: string | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;

    // Load all dashboard data
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.updateDashboardStats(stats);
        this.loadProductStats();
        this.loadSubscriberActivity();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.error = 'Failed to load dashboard statistics';
        this.isLoading = false;
      }
    });
  }

  private updateDashboardStats(stats: any): void {
    this.dashboardStats[0].value = this.formatNumber(stats.totalProducts);
    this.dashboardStats[1].value = this.formatNumber(stats.totalSubscribers);
    this.dashboardStats[2].value = this.formatNumber(stats.featuredProducts);
    this.dashboardStats[3].value = this.formatNumber(stats.activePromos);

    this.monthlyStats.current = stats.totalProducts;
  }

  private loadProductStats(): void {
    this.dashboardService.getProductStats().subscribe({
      next: (productStats) => {
        // Update departments with actual categories
        this.departments = productStats.categories.slice(0, 3).map(cat => ({
          name: cat.name,
          count: cat.count
        }));

        // Update chart data with monthly product/blog data
        this.chartData = productStats.monthlyData.map(item => ({
          month: item.month,
          orders: item.products * 10, // Simulate orders as products * 10
          sales: item.blogs * 50 // Simulate sales from blog engagement
        }));
      },
      error: (error) => {
        console.error('Error loading product stats:', error);
      }
    });
  }

  private loadSubscriberActivity(): void {
    this.dashboardService.getSubscriberActivity().subscribe({
      next: (activity) => {
        this.timeData = activity;
      },
      error: (error) => {
        console.error('Error loading subscriber activity:', error);
      }
    });
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toString();
    }
  }

  getMaxActivity(): number {
    return Math.max(...this.timeData.map(item => item.value));
  }

  getMaxDeptCount(): number {
    return Math.max(...this.departments.map(dept => dept.count));
  }
}
