import type { Room } from "./Room";
import type { User } from "./User";

export type ReservationStatus =
  | "CONFIRMED"
  | "CANCELLED"
  | "REFUNDED"
  | "CHECKED_IN"
  | "COMPLETED";

export type PaymentStatus = "PAID" | "REFUNDED" | null;

export type Transaction = {
  provider: "STRIPE";
  transactionId: string;
  amountCents: number;
  currency: string; // "usd"
  status: "SUCCEEDED";
  paidAt: string | null; // ISO instant
  refundId: string | null;
  refundedAt: string | null; // ISO instant
};

export type Reservation = {
  id: string;

  userId: string;
  roomId: string;

  checkIn: string;  // ISO date
  checkOut: string; // ISO date

  guestCount: number;
  totalPrice: number;

  status: ReservationStatus;
  paymentIntentId?: string | null;

  paymentStatus: PaymentStatus;
  transaction: Transaction | null;

  checkedInAt: string | null;

  user?: User;
  room?: Room;
};

export type PagedResponse<T> = {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
};

export type RevenueReportResponse = {
  totalRevenueCents: number;
  revenueByMonthCents: Record<string, number>;
};

export type ReservationUpdateRequest = {
  roomId: string;
  checkIn: string;  // ISO date
  checkOut: string; // ISO date
  guestCount: number;
};
