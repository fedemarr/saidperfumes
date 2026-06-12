import type { Category, Gender, OrderStatus, PaymentMethod, Role } from "@prisma/client";

export type { Category, Gender, OrderStatus, PaymentMethod, Role };

export interface ProductNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface ProductWithNotes {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  category: Category;
  gender: Gender;
  occasion: string[];
  notes: ProductNotes;
  images: string[];
  price: number;
  priceCash: number | null;
  priceTransfer: number | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  freeShipping: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItemType {
  id: string;
  productId: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  priceTransfer: number | null;
  quantity: number;
  slug: string;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  zip: string;
}

export interface OrderWithItems {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  shippingAddress: ShippingAddress;
  notes: string | null;
  paymentProof: string | null;
  paidAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    product: {
      id: string;
      name: string;
      brand: string;
      images: string[];
      slug: string;
    };
  }[];
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
}

export interface ProductFilters {
  category?: Category[];
  gender?: Gender[];
  brand?: string[];
  priceMin?: number;
  priceMax?: number;
  search?: string;
  sortBy?: "featured" | "price_asc" | "price_desc" | "newest" | "bestseller";
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  products: ProductWithNotes[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  newUsers: number;
  pendingOrders: number;
  revenueChart: { date: string; revenue: number }[];
  recentOrders: OrderWithItems[];
  lowStockProducts: ProductWithNotes[];
}
