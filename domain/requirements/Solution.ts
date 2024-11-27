import { Entity, Property } from '@mikro-orm/core';
import { slugify } from '../../shared/utils/slugify.js';
import { Requirement } from './Requirement.js';
import { ReqType } from './ReqType.js';

/**
 * A Solution is the aggregation of a Project, Environment, Goals, and a System
 */
@Entity({ discriminatorValue: ReqType.SOLUTION })
export class Solution extends Requirement {
    static override req_type: ReqType = ReqType.SOLUTION;

    constructor(props: ConstructorParameters<typeof Requirement>[0]) {
        super(props);
        this._slug = slugify(props.name);
    }

    private _slug: string;

    override set name(value: string) {
        super.name = value;
        this._slug = slugify(value);
    }

    /**
     * A slugified version of the name
     */
    @Property({ type: 'string', unique: true })
    get slug(): string { return this._slug; }
    set slug(value: string) {
        if (value !== slugify(this.name))
            throw new Error('Slug must be a slugified version of the name');
        this._slug = value;
    }
}