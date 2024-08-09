import { type Properties } from "../Properties.js";

/**
 * An AppUser is a user of the application
 */
export default class AppUser {
    constructor(properties: Properties<AppUser>) {
        this.id = properties.id;
        this.creationDate = properties.creationDate;
        this.isSystemAdmin = properties.isSystemAdmin;
        this.lastLoginDate = properties.lastLoginDate;
        this.name = properties.name;
        this.email = properties.email;
    }

    /**
     * The unique identifier of the AppUser (uuid)
     */
    id: string

    /**
     * The name of the AppUser
     */
    name: string;

    /**
     * The email address of the AppUser
     */
    email: string

    /**
     * The date the AppUser was created
     */
    creationDate: Date;

    /**
     * The date the AppUser last logged in
     */
    lastLoginDate?: Date;

    /**
     * Whether the AppUser is a system administrator
     */
    isSystemAdmin: boolean;

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            creationDate: this.creationDate.toISOString(),
            lastLoginDate: this.lastLoginDate?.toISOString(),
            isSystemAdmin: this.isSystemAdmin
        }
    }
}