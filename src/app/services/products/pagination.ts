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

        const start = this.nextIndex;
        const end = Math.min(start + limit, this.productsArray.length);
        const newItems = this.productsArray.slice(start, end);

        this.loadedItems = this.loadedItems.concat(newItems);
        this.nextIndex = end;
        this.allLoaded = this.nextIndex >= this.productsArray.length;

        return this.loadedItems;
    }

    reset(): Product[] {
        this.nextIndex = this.defaultLimit;
        this.allLoaded = this.nextIndex >= this.productsArray.length;
        this.loadedItems = this.productsArray.slice(0, this.defaultLimit);
        return this.loadedItems;
    }

    getInitialItems(): Product[] {
        return this.reset();
    }

    get isAllLoaded(): boolean {
        return this.allLoaded;
    }
}
