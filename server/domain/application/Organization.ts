import { Collection } from "@mikro-orm/core";
import slugify from "../../../utils/slugify.js";
import type { Properties } from "../Properties.js";
import { v7 as uuidv7 } from 'uuid';
import { type Solution } from "./index.js";

/**
 * An Organization is a collection of people and solutions
 */
export class Organization {
    constructor(properties: Omit<Properties<Organization>, 'id' | 'slug' | 'solutions'> & { solutions: Solution[] }) {
        this.id = uuidv7();
        this.name = properties.name;
        this.description = properties.description;
        this.slug = slugify(this.name);
        properties.solutions.forEach(solution => this.solutions.add(solution));
    }

    /**
     * The unique identifier of the Organization
     */
    id: string;

    /**
     * The description of the Organization
     */
    description: string;

    /**
     * The name of the Organization
     * @throws {Error} if the name is longer than 60 characters
     */
    name: string

    /**
     * A slugified version of the name
     */
    slug: string;

    /**
     * The solutions that belong to this organization
     */
    solutions = new Collection<Solution>(this);
}
