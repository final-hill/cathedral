import { Collection, Entity, OneToMany, Property } from "@mikro-orm/core";
import slugify from "../../utils/slugify.js";
import { v7 as uuidv7 } from 'uuid';
import { Solution } from "./index.js";

/**
 * An Organization is a collection of people and solutions
 */
@Entity()
class Organization {
    constructor(properties: Omit<Organization, 'id' | 'slug' | 'solutions'> & { solutions: Solution[] }) {
        this.id = uuidv7();
        this.name = properties.name;
        this.description = properties.description;
        this.slug = slugify(this.name);
        properties.solutions.forEach(solution => this.solutions.add(solution));
    }

    /**
     * The unique identifier of the Organization
     */
    @Property({ type: 'uuid', primary: true })
    id: string;

    /**
     * The description of the Organization
     */
    @Property({ type: 'string' })
    description: string;

    /**
     * The name of the Organization
     * @throws {Error} if the name is longer than 100 characters
     */
    @Property({ type: 'string', length: 100 })
    name: string

    /**
     * A slugified version of the name
     */
    @Property({ type: 'string', unique: true })
    slug: string;

    /**
     * The solutions that belong to this organization
     */
    @OneToMany({ entity: () => Solution, mappedBy: 'organization', orphanRemoval: true })
    solutions = new Collection<Solution>(this);
}

export { Organization };