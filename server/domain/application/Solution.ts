import { v7 as uuidv7 } from 'uuid';
import { type Properties } from '../Properties.js';
import Organization from './Organization.js';
import slugify from '../../../utils/slugify.js';

/**
 * A Solution is the aggregation of a Project, Environment, Goals, and a System
 */
export default class Solution {
    constructor(properties: Omit<Properties<Solution>, 'slug' | 'id'>) {
        this.id = uuidv7();
        this.description = properties.description;
        this.name = properties.name
        this.organization = properties.organization;
        this.slug = slugify(this.name);
    }

    /**
     * The unique identifier of the Solution
     */
    id: string

    /**
     * The Organization that owns this Solution
     */
    organization: Organization

    /**
     * The description of the Solution
     */
    description: string

    /**
     * The name of the Solution
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
            organizationId: this.organization
        }
    }
}