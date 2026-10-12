export type UserRole =
  | "CUSTOMER"
  | "RESTAURANT_STAFF"
  | "RESTAURANT_MANAGER"
  | "DELIVERY_PERSONNEL"
  | "SYSTEM_ADMIN";

export type OrderStatus =
  | "PLACED"
  | "ACCEPTED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface CustomizationOption {
  name: string;
  extraPrice: number;
}

export interface CustomizationGroup {
  name: string;
  options: CustomizationOption[];
}

export interface MenuItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  isVeg: boolean;
  isAvailable: boolean;
  isPopular: boolean;
  image: string;
  preparationTimeMin: number;
  customizationsJson?: string | null;
  restaurantId: string;
  categoryId: string;
}

export interface MenuCategoryType {
  id: string;
  name: string;
  description?: string | null;
  sortOrder: number;
  restaurantId: string;
  menuItems: MenuItemType[];
}

export interface RestaurantType {
  id: string;
  name: string;
  slug: string;
  description: string;
  cuisineType: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email: string;
  rating: number;
  totalReviews: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  deliveryFee: number;
  minOrderValue: number;
  priceRange: string;
  isVegOnly: boolean;
  isOpen: boolean;
  status: string;
  coverImage: string;
  logoImage: string;
  lat: number;
  lng: number;
  categories?: MenuCategoryType[];
  menuItems?: MenuItemType[];
  reviews?: ReviewType[];
}

export interface CartItemType {
  id: string;
  cartId: string;
  menuItemId: string;
  quantity: number;
  selectedCustomizations?: string | null;
  price: number;
  menuItem?: MenuItemType;
}

export interface CartType {
  id: string;
  userId: string;
  restaurantId?: string | null;
  restaurant?: RestaurantType | null;
  items: CartItemType[];
}

export interface OrderItemType {
  id: string;
  orderId: string;
  menuItemId?: string | null;
  name: string;
  price: number;
  quantity: number;
  customizationsJson?: string | null;
}

export interface OrderType {
  id: string;
  orderNumber: string;
  userId: string;
  restaurantId: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string | null;
  specialInstructions?: string | null;
  deliveryAddressJson: string;
  paymentMethod: string;
  paymentStatus: string;
  estimatedDeliveryMinutes: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  restaurant?: RestaurantType;
  items?: OrderItemType[];
  deliveryAssignment?: {
    id: string;
    deliveryPersonnelId?: string | null;
    status: string;
    currentLat: number;
    currentLng: number;
    pickupTime?: string | null;
    deliveredTime?: string | null;
    deliveryPersonnel?: {
      id: string;
      name: string;
      phone?: string | null;
      avatar?: string | null;
    } | null;
  } | null;
  payment?: {
    id: string;
    transactionId: string;
    method: string;
    status: string;
    amount: number;
  } | null;
  review?: ReviewType | null;
}

export interface AddressType {
  id: string;
  userId: string;
  label: string;
  recipient: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  state: string;
  postalCode: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export interface ReviewType {
  id: string;
  userId: string;
  restaurantId: string;
  orderId?: string | null;
  rating: number;
  comment: string;
  restaurantReply?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
}

export interface CouponType {
  id: string;
  code: string;
  description: string;
  discountPercent: number;
  maxDiscount: number;
  minOrderValue: number;
  validUntil: string;
  isActive: boolean;
}

export interface NotificationType {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  orderId?: string | null;
  isRead: boolean;
  createdAt: string;
}
