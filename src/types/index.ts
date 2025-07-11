export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "employee";
  createdAt: string;
}

export interface Client {
  _id: string;
  name: string;
  defaultAddress: string;
  phoneNumbers: string[];
  addresses: string[];
  rating: number;
  createdAt: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  orderId: string;
  trackId: string;
  clientId: string | Client;
  items: OrderItem[];
  deliveryFees: number;
  total: number;
  status: "pending" | "shipped" | "delivered" | "cancelled" | "returned";
  notes?: string;
  rating?: number;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  totalOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  netProfit: number;
  returnedOrders: number;
  averageOrderValue: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface Language {
  code: "en" | "ar";
  name: string;
  direction: "ltr" | "rtl";
}
