/**
 * Represents a user entity in the application.
 * This structure typically reflects the data stored in the backend database (MongoDB)
 * and populated via an authentication provider like Google.
 *
 * @interface
 */
export interface User {
    /**
     * The unique MongoDB document identifier for the user.
     */
    _id: string;

    /**
     * The unique identifier provided by Google's OAuth service.
     */
    googleId: string;

    /**
     * The user's full display name (e.g., "John Doe").
     */
    displayName: string;

    /**
     * The user's given name (first name).
     */
    firstName: string;

    /**
     * The user's family name (last name).
     */
    lastName: string;

    /**
     * The URL to the user's profile picture hosted by Google.
     */
    image: string;

    /**
     * The user's email address.
     */
    email: string;

    /**
     * The date string (ISO format) representing when the user account was created.
     */
    createdAt: string;
}