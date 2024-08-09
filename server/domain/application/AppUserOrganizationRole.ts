import { type Properties } from "../Properties.js";
import Organization from "./Organization.js";
import AppRole from "./AppRole.js";
import AppUser from "./AppUser.js";

/**
 * An AppUserOrganizationRole is a mapping between an AppUser, an Organization, and a Role
 */
export default class AppUserOrganizationRole {
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