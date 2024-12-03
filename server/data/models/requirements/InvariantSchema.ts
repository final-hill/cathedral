import { EntitySchema } from "@mikro-orm/core";
import { Invariant, Requirement, ReqType } from '../../../../domain/requirements/index.js';

export const InvariantSchema = new EntitySchema<Invariant, Requirement>({
    class: Invariant,
    discriminatorValue: ReqType.INVARIANT
})