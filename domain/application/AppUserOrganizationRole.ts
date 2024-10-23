import { BaseEntity, Entity, Enum, ManyToOne } from "@mikro-orm/core";
import { AppRole } from "./AppRole.js";
import { AppUser } from "./AppUser.js";
import { type Properties } from "../types/index.js";
import { Organization } from "../requirements/Organization.js";

/**
 * An AppUserOrganizationRole is a mapping between an AppUser, an Organization, and a Role
 */
@Entity()
export class AppUserOrganizationRole extends BaseEntity {
    constructor(props: Properties<AppUserOrganizationRole>) {
        super()
        this.appUser = props.appUser;
        this.organization = props.organization;
        this.role = props.role;
    }

    /**
     * The user associated with the OrganizationRole
     */
    @ManyToOne({ primary: true, entity: () => AppUser })
    appUser: AppUser;

    /**
     * The Organization associated with the OrganizationRole
     */
    @ManyToOne({ primary: true, entity: () => Organization })
    organization: Organization;

    /**
     * The Role associated with the OrganizationRole
     */
    @Enum({ items: () => AppRole, primary: true })
    role: AppRole
}