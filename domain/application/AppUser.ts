import { AppRole } from "./AppRole.js";

/**
 * An AppUser is a user of the application
 */
export class AppUser {
    constructor(props: Pick<AppUser, keyof AppUser>) {
        Object.assign(this, props);

        // email address: https://stackoverflow.com/a/574698
        if (props.name.length > 254)
            throw new Error('Name too long');
        if (!props.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/))
            throw new Error('Invalid email address');
        if (props.email.length > 254)
            throw new Error('Email address too long');
    }

    /**
     * The unique identifier of the AppUser (uuid)
     */
    readonly id!: string;

    /**
     * The name of the AppUser
     */
    readonly name!: string;

    /**
     * The date and time when the user was last modified
     */
    readonly lastModified!: Date;

    /**
     * Whether the user is deleted
     */
    readonly isDeleted!: boolean;

    /**
     * The email address of the AppUser
     */
    readonly email!: string;

    /**
     * The date the AppUser was created
     */
    readonly creationDate!: Date;

    /**
     * The date the AppUser last logged in
     */
    readonly lastLoginDate?: Date;

    /**
     * Whether the AppUser is a system administrator
     */
    readonly isSystemAdmin!: boolean;

    /**
     * The role of the AppUser.
     */
    readonly role?: AppRole;
}