import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxStarsModule } from 'ngx-stars';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { AvatarModule } from 'primeng/avatar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TranslateModule } from '@ngx-translate/core';
import { ReviewService } from '../../../services/reviews/review.service';
import { Review, ReviewSummary, CreateReviewRequest } from '../../../services/reviews/review.model';
import { AuthService } from '../../../services/auth/auth.service';
import { catchError, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxStarsModule,
    ButtonModule,
    InputTextareaModule,
    InputTextModule,
    ProgressBarModule,
    AvatarModule,
    ToastModule,
    TranslateModule
  ],
  templateUrl: './product-reviews.component.html',
  styleUrl: './product-reviews.component.scss',
  providers: [MessageService]
})
export class ProductReviewsComponent implements OnInit {
  @Input() productId!: number;

  private reviewService = inject(ReviewService);
  private messageService = inject(MessageService);
  authService = inject(AuthService);

  // Data
  reviews: Review[] = [];
  summary: ReviewSummary | null = null;
  myReview: Review | null = null;
  canReview = false;

  // Pagination
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  totalReviews = 0;

  // Form state
  showForm = false;
  isEditing = false;
  isSubmitting = false;
  newRating = 0;
  newTitle = '';
  newComment = '';

  // Loading states
  isLoading = true;

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.isLoading = true;

    // Load summary and reviews
    this.reviewService.getReviewSummary(this.productId).pipe(
      tap(summary => this.summary = summary),
      switchMap(() => this.reviewService.getProductReviews(this.productId, this.currentPage, this.pageSize)),
      tap(result => {
        this.reviews = result.items;
        this.totalPages = result.totalPages;
        this.totalReviews = result.totalCount;
      }),
      switchMap(() => {
        // Check if logged in user can review
        if (this.authService.isLoggedIn$) {
          return this.reviewService.getMyReview(this.productId).pipe(
            tap(review => {
              this.myReview = review;
              this.canReview = !review;
            }),
            catchError(() => {
              this.canReview = true;
              return of(null);
            })
          );
        }
        return of(null);
      }),
      catchError(err => {
        console.error('Error loading reviews:', err);
        return of(null);
      })
    ).subscribe(() => {
      this.isLoading = false;
    });
  }

  onRatingChange(rating: number): void {
    this.newRating = rating;
  }

  openReviewForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.newRating = 0;
    this.newTitle = '';
    this.newComment = '';
  }

  editReview(): void {
    if (this.myReview) {
      this.showForm = true;
      this.isEditing = true;
      this.newRating = this.myReview.rating;
      this.newTitle = this.myReview.title || '';
      this.newComment = this.myReview.comment;
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.newRating = 0;
    this.newTitle = '';
    this.newComment = '';
  }

  submitReview(): void {
    if (this.newRating < 1 || this.newRating > 5) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a rating' });
      return;
    }

    if (!this.newComment.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please enter a comment' });
      return;
    }

    this.isSubmitting = true;

    const request: CreateReviewRequest = {
      rating: Math.round(this.newRating),  // Ensure it's an integer
      title: this.newTitle.trim() || undefined,
      comment: this.newComment.trim()
    };

    if (this.isEditing && this.myReview) {
      this.reviewService.updateReview(this.myReview.id, request).pipe(
        catchError(err => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to update review' });
          return of(null);
        })
      ).subscribe(review => {
        this.isSubmitting = false;
        if (review) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Review updated successfully' });
          this.myReview = review;
          this.cancelForm();
          this.loadReviews();
        }
      });
    } else {
      this.reviewService.createReview(this.productId, request).pipe(
        catchError(err => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to submit review' });
          return of(null);
        })
      ).subscribe(review => {
        this.isSubmitting = false;
        if (review) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Review submitted successfully' });
          this.myReview = review;
          this.canReview = false;
          this.cancelForm();
          this.loadReviews();
        }
      });
    }
  }

  deleteReview(): void {
    if (!this.myReview) return;

    this.reviewService.deleteReview(this.myReview.id).pipe(
      catchError(err => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete review' });
        return of(false);
      })
    ).subscribe(success => {
      if (success) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Review deleted' });
        this.myReview = null;
        this.canReview = true;
        this.loadReviews();
      }
    });
  }

  loadPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.isLoading = true;
      this.reviewService.getProductReviews(this.productId, page, this.pageSize).subscribe(result => {
        this.reviews = result.items;
        this.isLoading = false;
      });
    }
  }

  getRatingPercentage(rating: number): number {
    if (!this.summary || this.summary.totalReviews === 0) return 0;
    return (this.summary.ratingDistribution[rating] || 0) / this.summary.totalReviews * 100;
  }

  getRatingCount(rating: number): number {
    return this.summary?.ratingDistribution[rating] || 0;
  }
}
