import { Product } from '../../models/product.model';

export class ProductPagination {
    private nextIndex = 0;
    private allLoaded = false;
    private loadedItems: Product[] = [];

    constructor(public productsArray: Product[], public defaultLimit = 4) {}

    getItems(limit = this.defaultLimit): Product[] {
        if (this.allLoaded) {
            return this.loadedItems;
        }

        // If this is the first load and no limit is specified, use defaultLimit
        const effectiveLimit =
            this.loadedItems.length === 0 ? limit : this.defaultLimit;

        const start = this.nextIndex;
        const end = Math.min(start + effectiveLimit, this.productsArray.length);
        const newItems = this.productsArray.slice(start, end);

        this.loadedItems = this.loadedItems.concat(newItems);
        this.nextIndex = end;
        this.allLoaded = this.nextIndex >= this.productsArray.length;

        return this.loadedItems;
    }

    reset(): Product[] {
        this.nextIndex = this.defaultLimit;
        this.allLoaded = false;
        this.loadedItems = this.productsArray.slice(0, this.defaultLimit);
        this.allLoaded = this.nextIndex >= this.productsArray.length;
        return this.loadedItems;
    }

    get isAllLoaded(): boolean {
        return this.allLoaded;
    }
}
