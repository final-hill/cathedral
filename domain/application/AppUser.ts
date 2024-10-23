import { BaseEntity, Entity, Enum, Property } from "@mikro-orm/core";
import { AppRole } from "./AppRole.js";
import { type Properties } from "../types/index.js";

/**
 * An AppUser is a user of the application
 */
@Entity()
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
    @Property({ type: 'uuid', primary: true })
    id: string;

    /**
     * The name of the AppUser
     */
    @Property({ type: 'string', length: 254 })
    name: string;

    /**
     * The email address of the AppUser
     */
    // email address: https://stackoverflow.com/a/574698
    @Property({ type: 'string', length: 254 })
    email: string;

    /**
     * The date the AppUser was created
     */
    @Property({ type: 'datetime' })
    creationDate: Date;

    /**
     * The date the AppUser last logged in
     */
    @Property({ type: 'datetime', nullable: true })
    lastLoginDate?: Date;

    /**
     * Whether the AppUser is a system administrator
     */
    @Property({ type: 'boolean' })
    isSystemAdmin: boolean;

    /**
     * The role of the AppUser.
     * Note: this field is not mapped in the ORM. It is populated in the API layer.
     * It's a design smell that needs to be addressed.
     */
    @Enum({ items: () => AppRole, persist: false })
    role?: AppRole;
}