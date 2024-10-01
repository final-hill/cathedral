import { AppRole, AppUser, Organization } from "./index.js";

/**
 * An AppUserOrganizationRole is a mapping between an AppUser, an Organization, and a Role
 */
export class AppUserOrganizationRole {
    constructor({ appUser, organization, role }: AppUserOrganizationRole) {
        this.appUser = appUser;
        this.organization = organization;
        this.role = role;
    }

    /**
     * The user associated with the OrganizationRole
     */
    appUser: AppUser;

    /**
     * The Organization associated with the OrganizationRole
     */
    organization: Organization;

    /**
     * The Role associated with the OrganizationRole
     */
    role: AppRole;
}
