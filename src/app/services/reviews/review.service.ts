import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/auth.model';
import {
  Review,
  ReviewSummary,
  CreateReviewRequest,
  UpdateReviewRequest,
  PagedReviews
} from './review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get paginated reviews for a product
   */
  getProductReviews(productId: number, page: number = 1, pageSize: number = 10): Observable<PagedReviews> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http
      .get<ApiResponse<PagedReviews>>(`${this.apiUrl}/products/${productId}/reviews`, { params })
      .pipe(map(response => response.data!));
  }

  /**
   * Get review summary (average rating and distribution)
   */
  getReviewSummary(productId: number): Observable<ReviewSummary> {
    return this.http
      .get<ApiResponse<ReviewSummary>>(`${this.apiUrl}/products/${productId}/reviews/summary`)
      .pipe(map(response => response.data!));
  }

  /**
   * Get current user's review for a product
   */
  getMyReview(productId: number): Observable<Review | null> {
    return this.http
      .get<ApiResponse<Review | null>>(`${this.apiUrl}/products/${productId}/reviews/my-review`)
      .pipe(map(response => response.data ?? null));
  }

  /**
   * Check if current user can review the product
   */
  canReview(productId: number): Observable<boolean> {
    return this.http
      .get<ApiResponse<boolean>>(`${this.apiUrl}/products/${productId}/reviews/can-review`)
      .pipe(map(response => response.data!));
  }

  /**
   * Create a new review
   */
  createReview(productId: number, request: CreateReviewRequest): Observable<Review> {
    return this.http
      .post<ApiResponse<Review>>(`${this.apiUrl}/products/${productId}/reviews`, request)
      .pipe(map(response => response.data!));
  }

  /**
   * Update an existing review
   */
  updateReview(reviewId: number, request: UpdateReviewRequest): Observable<Review> {
    return this.http
      .put<ApiResponse<Review>>(`${this.apiUrl}/reviews/${reviewId}`, request)
      .pipe(map(response => response.data!));
  }

  /**
   * Delete a review
   */
  deleteReview(reviewId: number): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(`${this.apiUrl}/reviews/${reviewId}`)
      .pipe(map(response => response.data!));
  }
}
