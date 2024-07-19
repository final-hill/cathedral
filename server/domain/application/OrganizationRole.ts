import Entity from "../Entity";
import { type Properties } from "../Properties";

/**
 * Represents a role in the Organization.
 */
export default class OrganizationRole extends Entity<string> {
    constructor({ id, description }: Properties<OrganizationRole>) {
        super({ id });
        this.description = description
    }

    /**
     * The description of the role.
     */
    description: string;
}