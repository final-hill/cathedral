import { Entity } from '@mikro-orm/core';
import { type Properties } from '../types/index.js';
import { MetaRequirement } from './MetaRequirement.js';
import { ReqType } from './ReqType.js';

/**
 * A requirement that has been parsed from natural language text
 */
@Entity({ discriminatorValue: ReqType.PARSED_REQUIREMENT })
export class ParsedRequirement extends MetaRequirement {
    constructor(props: Properties<Omit<ParsedRequirement, 'id' | 'req_type'>>) {
        super(props);
        this.req_type = ReqType.PARSED_REQUIREMENT;
    }
}