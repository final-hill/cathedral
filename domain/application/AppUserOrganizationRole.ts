import { AuditMetadata } from "../AuditMetadata.js";
import { AppRole } from "./AppRole.js";

/**
 * An AppUserOrganizationRole is a mapping between an AppUser, an Organization, and a Role
 */
export class AppUserOrganizationRole extends AuditMetadata {
    constructor({ appUserId, organizationId, role, ...parentProps }: Omit<AppUserOrganizationRole, 'toJSON'>) {
        super(parentProps);
        this.appUserId = appUserId;
        this.organizationId = organizationId;
        this.role = role;
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

    override toJSON() {
        return {
            ...super.toJSON(),
            appUserId: this.appUserId,
            organizationId: this.organizationId,
            role: this.role
        }
    }
}