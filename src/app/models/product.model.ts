export interface Product {
    id: number;
    name: string;
    rating: number;
    price: number;
    inStock: boolean;
    desc: string;
    colors: string[];
    images: string[];
    reviews: any[];
    discount: number;
    imageUrl: string;
    inWishlist: boolean;
    available:boolean;
    new: boolean;
    sales?: number;
    category: string;
    availableQuantity: number;
    quantity?: number;
    subTotal?: number;
    categoryId?: number;
}

export function mapToProduct(products: Product[], id: number): Product {
    return products[id];
}

