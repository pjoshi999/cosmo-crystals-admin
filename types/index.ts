export type ProductResponse = {
  products: Product[];
  message: string;
  pagination: {
    totalProducts: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
};

export type Product = {
  id?: string;
  name: string;
  description: string;
  price: number;
  salePrice: number;
  stock: number;
  categoryId: string;
  subcategory?: string;
  images: ProductImage[];
  category?: Category;
  attributes?: ProductAttributes[];
};

export type ProductImage = {
  id?: string;
  productId?: string;
  url: string;
  alt?: string;
  isMain: boolean;
};

export type Category = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  subCategory: Array<SubCategory>;
};

export interface SubCategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  categoryId: string;
  category: Category;
}

export interface ProductAttributes {
  id?: string;
  name: string;
  value: string;
  productId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ProductFilters = {
  page?: number;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
};

export type Review = {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string;
  user: {
    name: string;
  };
};

export type Testimonial = {
  id: string;
  name: string;
  avatar: string;
  text: string;
  rating: number;
};

export interface CartItemResponse {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
}

export interface CartItemPayload {
  productId: string;
  quantity: number;
}

export interface PendingCartAction {
  productName: string;
  productId: string;
  quantity: number;
}
