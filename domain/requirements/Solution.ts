import { slugify } from '../../shared/utils/slugify.js';
import { Requirement } from './Requirement.js';

/**
 * A Solution is the aggregation of a Project, Environment, Goals, and a System
 */
export class Solution extends Requirement {
    constructor(props: ConstructorParameters<typeof Requirement>[0]) {
        super(props);
        this.slug = slugify(props.name);
    }

    /**
     * A slugified version of the name
     */
    readonly slug: string;
}