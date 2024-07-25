import { type Properties } from "../Properties.js";

/**
 * An AppUser is a user of the application
 */
export default class AppUser {
    constructor(properties: Properties<AppUser>) {
        this.id = properties.id;
        this.creationDate = properties.creationDate;
        this.isSystemAdmin = properties.isSystemAdmin;
        this.name = properties.name;
    }

    /**
     * The unique identifier of the AppUser
     * In this case, an email address
     */
    id: string

    /**
     * The name of the AppUser
     */
    name: string;

    /**
     * The date the AppUser was created
     */
    creationDate: Date;

    /**
     * Whether the AppUser is a system administrator
     */
    isSystemAdmin: boolean;

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            creationDate: this.creationDate.toISOString(),
            isSystemAdmin: this.isSystemAdmin
        }
    }
}