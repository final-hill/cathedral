import { BaseEntity } from "@mikro-orm/core";
import { AppRole } from "./AppRole.js";
import { type Properties } from "../types/index.js";

/**
 * An AppUser is a user of the application
 */
export class AppUser extends BaseEntity {
    constructor(props: Properties<AppUser>) {
        super()
        this.id = props.id;
        this.creationDate = props.creationDate;
        this.isSystemAdmin = props.isSystemAdmin;
        this.lastLoginDate = props.lastLoginDate;
        this.name = props.name;
        this.email = props.email;
        this.role = props.role;
    }

    /**
     * The unique identifier of the AppUser (uuid)
     */
    id: string;

    private _name!: string;

    /**
     * The name of the AppUser
     */
    get name(): string { return this._name; }
    set name(value: string) {
        if (value.length > 254)
            throw new Error('Name too long');
        this._name = value;
    }

    private _email!: string;

    /**
     * The email address of the AppUser
     */
    // email address: https://stackoverflow.com/a/574698
    get email(): string { return this._email; }
    set email(value: string) {
        if (!value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/))
            throw new Error('Invalid email address');
        if (value.length > 254)
            throw new Error('Email address too long');
        this._email = value;
    }

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
     */
    // FIXME: this field is not mapped in the ORM. It is populated in the API layer.
    // It's a design smell that needs to be addressed.
    role?: AppRole;
}