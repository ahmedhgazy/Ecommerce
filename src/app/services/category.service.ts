import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';


export interface Category {
  id: number;
  name: string;
  count?: number;
  icon?: string;
}

interface ApiResponse<T> {
    data: T;
    success: boolean;
    message: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  // Assuming Backend endpoint is /api/categories
  private apiUrl = `${environment.apiUrl}/categories`;

  getCategories(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(this.apiUrl).pipe(
        map(res => res.data.map(c => ({
            ...c,
             // Map backend icons if available, or assign default
            icon: c.icon || this.getDefaultIcon(c.name)
        })))
    );
  }

  private getDefaultIcon(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('electronic') || lower.includes('computer')) return 'pi pi-desktop';
    if (lower.includes('cloth')) return 'pi pi-shopping-bag';
    if (lower.includes('home')) return 'pi pi-home';
    if (lower.includes('sport')) return 'pi pi-heart';
    if (lower.includes('book')) return 'pi pi-book';
    return 'pi pi-tag';
  }
}
