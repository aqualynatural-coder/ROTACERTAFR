export type Role = "ADMIN" | "DRIVER";

export type DeliveryStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_TRANSIT"
  | "ARRIVED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELED";

export type RouteStatus = "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELED";

export type FailureCode =
  | "CUSTOMER_ABSENT"
  | "WRONG_ADDRESS"
  | "CUSTOMER_REFUSED"
  | "VEHICLE_PROBLEM"
  | "OTHER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  driverId?: string | null;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
  notes?: string;
}

export interface Delivery {
  id: string;
  customerId: string;
  driverId?: string | null;
  routeId?: string | null;
  sequence: number;
  status: DeliveryStatus;
  scheduledAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  arrivedLat?: number;
  arrivedLng?: number;
  notes?: string;
  customer: Customer;
  proof?: { photoUrl: string; latitude: number; longitude: number; notes?: string; createdAt: string } | null;
  failure?: { code: FailureCode; notes?: string; createdAt: string } | null;
  route?: { id: string; name: string; status: RouteStatus };
}

export interface Route {
  id: string;
  name: string;
  status: RouteStatus;
  driverId?: string | null;
  scheduledFor: string;
  startedAt?: string;
  endedAt?: string;
  deliveries: Delivery[];
  driver?: { id: string; user: { id: string; name: string } };
}

export interface Driver {
  id: string;
  userId: string;
  phone?: string;
  licenseNumber?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  user: { id: string; name: string; email: string; active: boolean; avatarUrl?: string | null };
}

export interface LivePosition {
  driverId: string;
  name: string;
  avatarUrl?: string | null;
  vehiclePlate?: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  recordedAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: string;
}
