export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  category: string;
  images: string[]; // URLs or placeholders
  colors: string[];
  sizes: number[];
  stock: number;
  isNew: boolean;
  isBestSeller: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: number | string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'customer';
}
