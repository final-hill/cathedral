import { type Properties } from "../Properties.js";

/**
 * Represents a role in the Organization.
 */
export default class AppRole {
    constructor({ name }: Properties<AppRole>) {
        this.name = name
    }

    /**
     * The name of the role.
     */
    name: string;
}