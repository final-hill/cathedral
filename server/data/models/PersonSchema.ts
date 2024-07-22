import { EntitySchema } from "@mikro-orm/core";
import Actor from "../../domain/Actor.js";
import Person from "../../domain/Person.js";
import RequirementSchema from "./RequirementSchema.js";

export default new EntitySchema<Person, Actor>({
    class: Person,
    extends: RequirementSchema,
    properties: {
        email: { type: 'string', nullable: false }
    }
})