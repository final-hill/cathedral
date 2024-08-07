import { type Properties } from "../Properties.js";
import Organization from "./Organization.js";
import AppRole from "./AppRole.js";

/**
 * An AppUserOrganizationRole is a mapping between an AppUser, an Organization, and a Role
 */
export default class AppUserOrganizationRole {
    constructor({ appUserId, organization, role }: Properties<AppUserOrganizationRole>) {
        this.appUserId = appUserId
        this.organization = organization
        this.role = role
    }

    /**
     * The userId associated with the OrganizationRole
     */
    appUserId: string

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
            appuserId: this.appUserId,
            organizationId: this.organization,
            roleName: this.role
        }
    }
}