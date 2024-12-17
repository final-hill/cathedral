import { AppRole } from "./AppRole.js";

/**
 * An AppUserOrganizationRole is a mapping between an AppUser, an Organization, and a Role
 */
export class AppUserOrganizationRole {
    constructor(props: Pick<AppUserOrganizationRole, keyof AppUserOrganizationRole>) {
        Object.assign(this, props);
    }

    /**
     * The user associated with the OrganizationRole
     */
    readonly appUserId!: string;

    /**
     * The Organization associated with the OrganizationRole
     */
    readonly organizationId!: string;

    /**
     * The Role associated with the OrganizationRole
     */
    readonly role!: AppRole

    /**
     * Whether the relation is deleted
     */
    readonly deleted!: boolean;

    /**
     * The date and time when the relation was last modified
     */
    readonly effectiveFrom!: Date;
}