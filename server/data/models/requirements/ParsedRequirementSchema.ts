import { EntitySchema } from '@mikro-orm/core';
import { MetaRequirement, ParsedRequirement, ReqType } from '../../../../domain/requirements/index.js';

export const ParsedRequirementSchema = new EntitySchema<ParsedRequirement, MetaRequirement>({
    class: ParsedRequirement,
    discriminatorValue: ReqType.PARSED_REQUIREMENT
})