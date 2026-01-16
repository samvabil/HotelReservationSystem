import type { Room } from "./Room";
import type { User } from "./User";

/**
 * Represents the possible status values for a reservation.
 */
export type ReservationStatus =
  | "CONFIRMED"
  | "CANCELLED"
  | "REFUNDED"
  | "CHECKED_IN"
  | "COMPLETED";

/**
 * Represents the payment status of a reservation.
 */
export type PaymentStatus = "PAID" | "REFUNDED" | null;

/**
 * Represents a payment transaction record.
 */
export type Transaction = {
  /** The payment provider name (e.g., "STRIPE"). */
  provider: "STRIPE";
  /** The unique transaction identifier from the payment provider. */
  transactionId: string;
  /** The transaction amount in cents. */
  amountCents: number;
  /** The currency code (e.g., "usd"). */
  currency: string; // "usd"
  /** The transaction status. */
  status: "SUCCEEDED";
  /** The ISO timestamp when payment was processed. */
  paidAt: string | null; // ISO instant
  /** The refund identifier if the transaction was refunded. */
  refundId: string | null;
  /** The ISO timestamp when refund was processed. */
  refundedAt: string | null; // ISO instant
};

/**
 * Represents a reservation/booking in the hotel system.
 */
export type Reservation = {
  /** The unique identifier for the reservation. */
  id: string;

  /** The unique identifier of the user who made the reservation. */
  userId: string;
  /** The unique identifier of the reserved room. */
  roomId: string;

  /** The scheduled check-in date in ISO format. */
  checkIn: string;  // ISO date
  /** The scheduled check-out date in ISO format. */
  checkOut: string; // ISO date

  /** The number of guests staying in the room. */
  guestCount: number;
  /** The total cost of the reservation. */
  totalPrice: number;

  /** The current lifecycle status of the reservation. */
  status: ReservationStatus;
  /** The Stripe payment intent identifier. */
  paymentIntentId?: string | null;

  /** The payment status of the reservation. */
  paymentStatus: PaymentStatus;
  /** The payment transaction details. */
  transaction: Transaction | null;

  /** The ISO timestamp when the guest checked in. */
  checkedInAt: string | null;

  /** The user object (populated for display purposes). */
  user?: User;
  /** The room object (populated for display purposes). */
  room?: Room;
};

/**
 * Generic type for paginated API responses.
 *
 * @template T The type of items in the response.
 */
export type PagedResponse<T> = {
  /** The list of items for the current page. */
  items: T[];
  /** The current page number (0-indexed). */
  page: number;
  /** The number of items per page. */
  size: number;
  /** The total number of items across all pages. */
  totalItems: number;
  /** The total number of pages. */
  totalPages: number;
};

/**
 * Represents a revenue report response.
 */
export type RevenueReportResponse = {
  /** The total revenue in cents across all time periods. */
  totalRevenueCents: number;
  /** A map of monthly revenue where keys are "YYYY-MM" and values are revenue in cents. */
  revenueByMonthCents: Record<string, number>;
};

/**
 * Request type for updating a reservation.
 */
export type ReservationUpdateRequest = {
  /** The unique identifier of the room to reserve. */
  roomId: string;
  /** The desired check-in date in ISO format. */
  checkIn: string;  // ISO date
  /** The desired check-out date in ISO format. */
  checkOut: string; // ISO date
  /** The number of guests. */
  guestCount: number;
};
