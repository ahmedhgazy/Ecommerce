import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../../models/product.model';
import { ApiResponse } from '../../models/auth.model';
import { environment } from '../../../environments/environment';

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface ProductQueryParams {
    pageNumber?: number;
    pageSize?: number;
    categoryId?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    inStock?: boolean;
    minPrice?: number;
    maxPrice?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
    private readonly apiUrl = `${environment.apiUrl}/products`;

    constructor(private http: HttpClient) { }

    getProducts(params: ProductQueryParams = {}): Observable<PagedResult<Product>> {
        let httpParams = new HttpParams();

        if (params.pageNumber) httpParams = httpParams.set('pageNumber', params.pageNumber.toString());
        if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize.toString());
        if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId.toString());
        if (params.search) httpParams = httpParams.set('search', params.search);
        if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
        if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
        if (params.inStock !== undefined) httpParams = httpParams.set('inStock', params.inStock.toString());
        if (params.minPrice) httpParams = httpParams.set('minPrice', params.minPrice.toString());
        if (params.maxPrice) httpParams = httpParams.set('maxPrice', params.maxPrice.toString());

        return this.http.get<ApiResponse<PagedResult<Product>>>(`${this.apiUrl}`, { params: httpParams })
            .pipe(map(response => response.data!));
    }

    getProductById(id: number): Observable<Product> {
        return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`)
            .pipe(map(response => response.data!));
    }

    getFlashSales(pageNumber: number = 1, pageSize: number = 8): Observable<PagedResult<Product>> {
        const params = new HttpParams()
            .set('pageNumber', pageNumber.toString())
            .set('pageSize', pageSize.toString());

        return this.http.get<ApiResponse<PagedResult<Product>>>(`${this.apiUrl}/flash-sales`, { params })
            .pipe(map(response => response.data!));
    }

    getBestSelling(pageNumber: number = 1, pageSize: number = 8): Observable<PagedResult<Product>> {
        const params = new HttpParams()
            .set('pageNumber', pageNumber.toString())
            .set('pageSize', pageSize.toString());

        return this.http.get<ApiResponse<PagedResult<Product>>>(`${this.apiUrl}/best-selling`, { params })
            .pipe(map(response => response.data!));
    }

    getNewArrivals(pageNumber: number = 1, pageSize: number = 8): Observable<PagedResult<Product>> {
        const params = new HttpParams()
            .set('pageNumber', pageNumber.toString())
            .set('pageSize', pageSize.toString());

        return this.http.get<ApiResponse<PagedResult<Product>>>(`${this.apiUrl}/new-arrivals`, { params })
            .pipe(map(response => response.data!));
    }

    getProductsByCategory(categoryId: number, pageNumber: number = 1, pageSize: number = 8): Observable<PagedResult<Product>> {
        return this.getProducts({ categoryId, pageNumber, pageSize });
    }

    searchProducts(search: string, pageNumber: number = 1, pageSize: number = 8): Observable<PagedResult<Product>> {
        return this.getProducts({ search, pageNumber, pageSize });
    }
}
