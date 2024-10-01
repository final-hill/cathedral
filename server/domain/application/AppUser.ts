import { AppRole } from "./AppRole.js";

/**
 * An AppUser is a user of the application
 */
export class AppUser {
    constructor(properties: AppUser) {
        this.id = properties.id;
        this.creationDate = properties.creationDate;
        this.isSystemAdmin = properties.isSystemAdmin;
        this.lastLoginDate = properties.lastLoginDate;
        this.name = properties.name;
        this.email = properties.email;
        this.role = properties.role;
    }

    /**
     * The unique identifier of the AppUser (uuid)
     */
    id: string;

    /**
     * The name of the AppUser
     */
    name: string;

    /**
     * The email address of the AppUser
     */
    email: string;

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

    /**
     * The role of the AppUser.
     * Note: this field is not mapped in the ORM. It is populated in the API layer.
     * It's a design smell that needs to be addressed.
     */
    role?: AppRole;
}
