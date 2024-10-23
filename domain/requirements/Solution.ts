import { Entity, Property } from '@mikro-orm/core';
import { type Properties } from '../types/index.js';
import slugify from '../../utils/slugify.js';
import { Requirement } from './Requirement.js';
import { ReqType } from './ReqType.js';

/**
 * A Solution is the aggregation of a Project, Environment, Goals, and a System
 */
@Entity({ discriminatorValue: ReqType.SOLUTION })
export class Solution extends Requirement {
    constructor(props: Properties<Omit<Solution, 'slug' | 'id' | 'req_type'>>) {
        super(props)
        this.slug = slugify(props.name);
        this.req_type = ReqType.SOLUTION;
    }

    /**
     * A slugified version of the name
     */
    @Property({ type: 'string', unique: true })
    slug: string;
}