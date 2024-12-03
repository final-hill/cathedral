import { EntitySchema } from "@mikro-orm/core";
import { Silence, Requirement, ReqType } from '../../../../domain/requirements/index.js';

export const SilenceSchema = new EntitySchema<Silence, Requirement>({
    class: Silence,
    discriminatorValue: ReqType.SILENCE
})