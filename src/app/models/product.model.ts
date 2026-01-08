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
    quantity: number;
    subTotal?: number;
}

export function mapToProduct(products: Product[], id: number): Product {
    return products[id];
}

