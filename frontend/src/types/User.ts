/**
 * Represents a user entity in the application.
 * This structure typically reflects the data stored in the backend database (MongoDB)
 * and populated via an authentication provider like Google.
 */
export interface User {
    /** The unique MongoDB document identifier for the user. */
    id: string;

    /** The user's given name (first name). */
    firstName: string;

    /** The user's family name (last name). */
    lastName: string;

    /** OAuth provider details including profile picture URL. */
    auth?: {
        /** The unique user ID returned by the provider. */
        providerId: string;
        /** The URL to the user's profile picture hosted by the OAuth provider. */
        avatarUrl: string; // Match your Java field name
    };

    /** The user's email address. */
    email: string;

    /** The unique customer ID assigned by Stripe for payment processing. */
    stripeCustomerId: string;
}