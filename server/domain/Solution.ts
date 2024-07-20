import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v7 as uuidv7 } from 'uuid';
import slugify from '../../lib/slugify.js';
import { type Properties } from './Properties.js';

/**
 * A Solution is the aggregation of a Project, Environment, Goals, and a System
 */
@Entity()
export default class Solution {
    static readonly maxNameLength = 60;

    constructor(properties: Omit<Properties<Solution>, 'slug' | 'id'>) {
        Object.assign(this, properties);
        this.slug = slugify(this.name);
    }

    /**
     * The unique identifier of the Solution
     */
    @PrimaryKey({ type: 'uuid' })
    id = uuidv7()

    /**
     * The description of the Solution
     */
    @Property()
    description!: string

    /**
     * The name of the Solution
     */
    @Property({ length: Solution.maxNameLength })
    name!: string

    /**
     * A slugified version of the name
     */
    @Property({ unique: true })
    slug!: string
}