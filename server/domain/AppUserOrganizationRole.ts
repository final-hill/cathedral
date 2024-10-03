import { Entity, Enum, ManyToOne } from "@mikro-orm/core";
import { AppRole, AppUser, Organization } from "./index.js";

/**
 * An AppUserOrganizationRole is a mapping between an AppUser, an Organization, and a Role
 */
@Entity()
class AppUserOrganizationRole {
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

export { AppUserOrganizationRole };