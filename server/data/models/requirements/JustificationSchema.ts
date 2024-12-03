import { EntitySchema } from "@mikro-orm/core";
import { Justification, MetaRequirement, ReqType } from '../../../../domain/requirements/index.js';

export const JustificationSchema = new EntitySchema<Justification, MetaRequirement>({
    class: Justification,
    discriminatorValue: ReqType.JUSTIFICATION
})
