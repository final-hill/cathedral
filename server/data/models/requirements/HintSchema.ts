import { EntitySchema } from "@mikro-orm/core";
import { Hint, Noise, ReqType } from '../../../../domain/requirements/index.js';

export const HintSchema = new EntitySchema<Hint, Noise>({
    class: Hint,
    discriminatorValue: ReqType.HINT
})