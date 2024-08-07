import { type Properties } from "../Properties.js";

/**
 * An AppUserSystemAdminRole is an assignment of a System Admin Role to an AppUser
 */
export default class AppUserSystemAdminRole {
    constructor({ appUserId }: Properties<AppUserSystemAdminRole>) {
        this.appUserId = appUserId
    }

    /**
     * The userId associated with the OrganizationRole
     */
    appUserId: string

    toJSON() {
        return {
            appuserId: this.appUserId
        }
    }
}