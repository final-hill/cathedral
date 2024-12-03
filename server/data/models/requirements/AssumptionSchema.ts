import { EntitySchema } from "@mikro-orm/core";
import { Assumption, Requirement, ReqType } from '../../../../domain/requirements/index.js';

export const AssumptionSchema = new EntitySchema<Assumption, Requirement>({
    class: Assumption,
    discriminatorValue: ReqType.ASSUMPTION
})