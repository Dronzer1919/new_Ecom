import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';

export interface DashboardStats {
  totalProducts: number;
  totalSubscribers: number;
  featuredProducts: number;
  topRatedProducts: number;
  totalBlogs: number;
  activePromos: number;
}

export interface ProductStats {
  totalItems: number;
  categories: Array<{
    name: string;
    count: number;
  }>;
  monthlyData: Array<{
    month: string;
    products: number;
    blogs: number;
  }>;
}

export interface SubscriberStats {
  totalSubscribers: number;
  totalUnsubscribed: number;
  totalAll: number;
  monthlyStats: Array<{
    _id: { year: number; month: number };
    count: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Get all dashboard statistics
  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      products: this.http.get<any>(`${this.baseUrl}/products/all?limit=1`),
      featuredProducts: this.http.get<any>(`${this.baseUrl}/products/featured`),
      topRatedProducts: this.http.get<any>(`${this.baseUrl}/products/top-rated`),
      subscriberStats: this.http.get<any>(`${this.baseUrl}/newsletter/stats`),
      blogs: this.http.get<any>(`${this.baseUrl}/blogs/all?limit=1`),
      promos: this.http.get<any>(`${this.baseUrl}/promos/active`)
    }).pipe(
      map(responses => ({
        totalProducts: responses.products.success ? responses.products.pagination?.totalItems || 0 : 0,
        totalSubscribers: responses.subscriberStats.success ? responses.subscriberStats.data.totalSubscribers : 0,
        featuredProducts: responses.featuredProducts.success ? responses.featuredProducts.data?.length || 0 : 0,
        topRatedProducts: responses.topRatedProducts.success ? responses.topRatedProducts.data?.length || 0 : 0,
        totalBlogs: responses.blogs.success ? responses.blogs.pagination?.totalItems || 0 : 0,
        activePromos: responses.promos.success ? responses.promos.data?.length || 0 : 0
      }))
    );
  }

  // Get product statistics with category breakdown
  getProductStats(): Observable<ProductStats> {
    return forkJoin({
      allProducts: this.http.get<any>(`${this.baseUrl}/products/all?limit=100`),
      allBlogs: this.http.get<any>(`${this.baseUrl}/blogs/all?limit=100`)
    }).pipe(
      map(responses => {
        const products = responses.allProducts.success ? responses.allProducts.data : [];
        const blogs = responses.allBlogs.success ? responses.allBlogs.data : [];

        // Group products by category
        const categoryMap = new Map<string, number>();
        products.forEach((product: any) => {
          const categoryName = product.category?.name || 'Uncategorized';
          categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
        });

        const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
          name,
          count
        }));

        // Generate monthly data for the last 6 months
        const monthlyData = this.generateMonthlyData(products, blogs);

        return {
          totalItems: products.length,
          categories,
          monthlyData
        };
      })
    );
  }

  // Get subscriber statistics
  getSubscriberStats(): Observable<SubscriberStats> {
    return this.http.get<any>(`${this.baseUrl}/newsletter/stats`).pipe(
      map(response => response.success ? response.data : {
        totalSubscribers: 0,
        totalUnsubscribed: 0,
        totalAll: 0,
        monthlyStats: []
      })
    );
  }

  // Get newsletter subscribers for time-based activity
  getSubscriberActivity(): Observable<Array<{time: string; value: number}>> {
    return this.http.get<any>(`${this.baseUrl}/newsletter/subscribers?limit=100`).pipe(
      map(response => {
        if (!response.success || !response.data) {
          return this.generateSampleTimeData();
        }

        const subscribers = response.data;
        const hourlyActivity = new Array(24).fill(0);

        // Count subscribers by hour of subscription
        subscribers.forEach((subscriber: any) => {
          if (subscriber.subscribedAt) {
            const hour = new Date(subscriber.subscribedAt).getHours();
            hourlyActivity[hour]++;
          }
        });

        // Return only business hours (7 AM to 8 PM)
        return [
          { time: '07 am', value: hourlyActivity[7] },
          { time: '09 am', value: hourlyActivity[9] },
          { time: '11 am', value: hourlyActivity[11] },
          { time: '01 pm', value: hourlyActivity[13] },
          { time: '03 pm', value: hourlyActivity[15] },
          { time: '05 pm', value: hourlyActivity[17] },
          { time: '07 pm', value: hourlyActivity[19] }
        ];
      })
    );
  }

  private generateMonthlyData(products: any[], blogs: any[]): Array<{month: string; products: number; blogs: number}> {
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return months.map((month, index) => {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - (5 - index));

      const monthProducts = products.filter(product => {
        if (!product.createdAt) return false;
        const productDate = new Date(product.createdAt);
        return productDate.getMonth() === monthDate.getMonth() &&
               productDate.getFullYear() === monthDate.getFullYear();
      }).length;

      const monthBlogs = blogs.filter(blog => {
        if (!blog.createdAt) return false;
        const blogDate = new Date(blog.createdAt);
        return blogDate.getMonth() === monthDate.getMonth() &&
               blogDate.getFullYear() === monthDate.getFullYear();
      }).length;

      return {
        month,
        products: monthProducts,
        blogs: monthBlogs
      };
    });
  }

  private generateSampleTimeData(): Array<{time: string; value: number}> {
    return [
      { time: '07 am', value: Math.floor(Math.random() * 10) + 5 },
      { time: '09 am', value: Math.floor(Math.random() * 15) + 10 },
      { time: '11 am', value: Math.floor(Math.random() * 12) + 8 },
      { time: '01 pm', value: Math.floor(Math.random() * 18) + 12 },
      { time: '03 pm', value: Math.floor(Math.random() * 14) + 9 },
      { time: '05 pm', value: Math.floor(Math.random() * 16) + 11 },
      { time: '07 pm', value: Math.floor(Math.random() * 8) + 3 }
    ];
  }
}
