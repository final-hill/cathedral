import { EntitySchema } from "@mikro-orm/core";
import { Actor, Person, ReqType } from '../../../../domain/requirements/index.js';

export const PersonSchema = new EntitySchema<Person, Actor>({
    class: Person,
    discriminatorValue: ReqType.PERSON,
    properties: {
        email: { type: 'string', length: 254 }
    }
})