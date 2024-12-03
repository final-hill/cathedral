import { EntitySchema } from "@mikro-orm/core";
import { Outcome, Goal, ReqType } from '../../../../domain/requirements/index.js';

export const OutcomeSchema = new EntitySchema<Outcome, Goal>({
    class: Outcome,
    discriminatorValue: ReqType.OUTCOME
})