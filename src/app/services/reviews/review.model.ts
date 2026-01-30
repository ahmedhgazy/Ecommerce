// Review interfaces matching the API DTOs

export interface ReviewUser {
  id: number;
  displayName: string;
  photoUrl: string | null;
}

export interface Review {
  id: number;
  rating: number;
  title: string | null;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  user: ReviewUser;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

export interface CreateReviewRequest {
  rating: number;
  title?: string;
  comment: string;
}

export interface UpdateReviewRequest {
  rating: number;
  title?: string;
  comment: string;
}

export interface PagedReviews {
  items: Review[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
