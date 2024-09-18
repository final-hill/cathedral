import { type Properties } from "../Properties.js";
import { AppRole, AppUser, Organization } from "./index.js";

/**
 * An AppUserOrganizationRole is a mapping between an AppUser, an Organization, and a Role
 */
export class AppUserOrganizationRole {
    constructor({ appUser, organization, role }: Properties<AppUserOrganizationRole>) {
        this.appUser = appUser
        this.organization = organization
        this.role = role
    }

    /**
     * The user associated with the OrganizationRole
     */
    appUser: AppUser

    /**
     * The Organization associated with the OrganizationRole
     */
    organization: Organization

    /**
     * The Role associated with the OrganizationRole
     */
    role: AppRole

    toJSON() {
        return {
            appuserId: this.appUser.id,
            organizationId: this.organization.id,
            role: this.role
        }
    }
}