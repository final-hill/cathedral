import { EntitySchema } from "@mikro-orm/core";
import { Actor, Requirement, ReqType } from '../../../../domain/requirements/index.js';

export const ActorSchema = new EntitySchema<Actor, Requirement>({
    class: Actor,
    discriminatorValue: ReqType.ACTOR
})