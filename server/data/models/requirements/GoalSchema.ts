import { EntitySchema } from "@mikro-orm/core";
import { Goal, Requirement, ReqType } from '../../../../domain/requirements/index.js';

export const GoalSchema = new EntitySchema<Goal, Requirement>({
    class: Goal,
    discriminatorValue: ReqType.GOAL
})