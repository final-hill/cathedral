import { EntitySchema } from "@mikro-orm/core";
import { Effect, Requirement, ReqType } from '../../../../domain/requirements/index.js';

export const EffectSchema = new EntitySchema<Effect, Requirement>({
    class: Effect,
    discriminatorValue: ReqType.EFFECT
})