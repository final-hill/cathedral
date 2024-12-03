import { EntitySchema } from "@mikro-orm/core";
import { Noise, Requirement, ReqType } from '../../../../domain/requirements/index.js';

export const NoiseSchema = new EntitySchema<Noise, Requirement>({
    class: Noise,
    discriminatorValue: ReqType.NOISE
})