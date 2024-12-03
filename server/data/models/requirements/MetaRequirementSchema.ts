import { EntitySchema } from "@mikro-orm/core";
import { Requirement, ReqType, MetaRequirement } from '../../../../domain/requirements/index.js';

export const MetaRequirementSchema = new EntitySchema<MetaRequirement, Requirement>({
    class: MetaRequirement,
    discriminatorValue: ReqType.META_REQUIREMENT
})