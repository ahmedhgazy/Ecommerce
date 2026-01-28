import { Component, OnInit, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

import { ProductsService } from '../../services/products/products.service';
import { Product } from '../../models/product.model';
import { ProductItemComponent } from '../../components/producsts/product-item/product-item.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { LoadingService } from '../../core/services/loading.service';
import { TranslateModule } from '@ngx-translate/core';
import { CategoryService, Category } from '../../services/category.service';

interface FilterState {
  search: string;
  categoryId: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: string;
  inStock: boolean;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ProductItemComponent,
    LoadingComponent,
    TranslateModule
  ],
  styleUrls: ['./products.component.scss'],
  templateUrl: './products.component.html'
})
export class ProductsComponent implements OnInit, OnDestroy {
  private productsService = inject(ProductsService);
  private categoryService = inject(CategoryService);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  private priceSubject = new Subject<void>();

  // State
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  totalProducts = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  pageSize = 12;
  loading = signal(false);
  showFilters = signal(false);
  viewMode = signal<'grid' | 'list'>('grid');

  // Filter state
  filters = signal<FilterState>({
    search: '',
    categoryId: null,
    minPrice: null,
    maxPrice: null,
    sortBy: '',
    inStock: false
  });

  // Local form bindings
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy: string = '';

  // Computed
  activeFiltersCount = computed(() => {
    const f = this.filters();
    let count = 0;
    if (f.search) count++;
    if (f.categoryId !== null) count++;
    if (f.minPrice !== null || f.maxPrice !== null) count++;
    if (f.inStock) count++;
    return count;
  });

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (current < total - 2) pages.push('...');
      pages.push(total);
    }

    return pages;
  });

  ngOnInit(): void {
    // Debounced search
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(search => {
      this.filters.update(f => ({ ...f, search }));
      this.currentPage.set(1);
      this.loadProducts();
    });

    // Debounced price filter
    this.priceSubject.pipe(
      debounceTime(500),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.filters.update(f => ({ ...f, minPrice: this.minPrice, maxPrice: this.maxPrice }));
      this.currentPage.set(1);
      this.loadProducts();
    });

    // Initial load
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(res => {
      this.categories.set(res);
    });
  }

  loadProducts(): void {
    this.loading.set(true);
    const f = this.filters();

    const params: any = {
      pageNumber: this.currentPage(),
      pageSize: this.pageSize
    };

    if (f.search) params.search = f.search;
    if (f.categoryId) params.categoryId = f.categoryId;
    if (f.minPrice) params.minPrice = f.minPrice;
    if (f.maxPrice) params.maxPrice = f.maxPrice;
    if (f.sortBy) params.sortBy = f.sortBy;
    if (f.inStock) params.inStock = true;

    this.productsService.getProducts(params).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.products.set(response.items || []);
        this.totalProducts.set(response.totalCount || 0);
        this.totalPages.set(response.totalPages || 1);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  onPriceChange(): void {
    this.priceSubject.next();
  }

  onSortChange(value: string): void {
    this.filters.update(f => ({ ...f, sortBy: value }));
    this.loadProducts();
  }

  selectCategory(id: number | null): void {
    this.filters.update(f => ({ ...f, categoryId: id }));
    this.currentPage.set(1);
    this.loadProducts();
    this.showFilters.set(false);
  }

  toggleInStock(): void {
    this.filters.update(f => ({ ...f, inStock: !f.inStock }));
    this.currentPage.set(1);
    this.loadProducts();
  }

  clearFilters(): void {
    this.filters.set({
      search: '',
      categoryId: null,
      minPrice: null,
      maxPrice: null,
      sortBy: '',
      inStock: false
    });
    this.minPrice = null;
    this.maxPrice = null;
    this.sortBy = '';
    this.currentPage.set(1);
    this.loadProducts();
  }

  toggleFilters(): void {
    this.showFilters.update(v => !v);
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
