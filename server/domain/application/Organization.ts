import slugify from "../../../utils/slugify.js";
import type { Properties } from "../Properties.js";
import { v7 as uuidv7 } from 'uuid';

/**
 * An Organization is a collection of people and solutions
 */
export default class Organization {
    constructor(properties: Omit<Properties<Organization>, 'id' | 'slug'>) {
        this.id = uuidv7();
        this.name = properties.name;
        this.description = properties.description;
        this.slug = slugify(this.name);
    }

    /**
     * The unique identifier of the Organization
     */
    id: string

    /**
     * The description of the Organization
     */
    description: string

    /**
     * The name of the Organization
     * @throws {Error} if the name is longer than 60 characters
     */
    name: string

    /**
     * A slugified version of the name
     */
    slug: string

    toJSON() {
        return {
            id: this.id,
            description: this.description,
            name: this.name,
            slug: this.slug,
        }
    }
}