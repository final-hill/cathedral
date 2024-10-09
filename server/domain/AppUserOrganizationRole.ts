import { Entity, Enum, ManyToOne } from "@mikro-orm/core";
import { AppRole } from "./AppRole.js";
import { AppUser } from "./AppUser.js";
import { Organization } from "./Organization.js";

/**
 * An AppUserOrganizationRole is a mapping between an AppUser, an Organization, and a Role
 */
@Entity()
export class AppUserOrganizationRole {
    constructor({ appUser, organization, role }: AppUserOrganizationRole) {
        this.appUser = appUser;
        this.organization = organization;
        this.role = role;
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
    role: AppRole = AppRole.ORGANIZATION_READER;
}