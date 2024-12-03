import { EntitySchema } from "@mikro-orm/core";
import { Requirement, ReqType, Limit } from '../../../../domain/requirements/index.js';

export const LimitSchema = new EntitySchema<Limit, Requirement>({
    class: Limit,
    discriminatorValue: ReqType.LIMIT
})