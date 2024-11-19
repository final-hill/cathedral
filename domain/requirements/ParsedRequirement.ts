import { Entity } from '@mikro-orm/core';
import { MetaRequirement } from './MetaRequirement.js';
import { ReqType } from './ReqType.js';

/**
 * A requirement that has been parsed from natural language text
 */
@Entity({ discriminatorValue: ReqType.PARSED_REQUIREMENT })
export class ParsedRequirement extends MetaRequirement {
    static override req_type: ReqType = ReqType.PARSED_REQUIREMENT;
}