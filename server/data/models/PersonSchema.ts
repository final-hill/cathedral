import { EntitySchema } from "@mikro-orm/core";
import Actor from "../../domain/requirements/Actor.js";
import Person from "../../domain/requirements/Person.js";
import RequirementSchema from "./RequirementSchema.js";

export default new EntitySchema<Person, Actor>({
    class: Person,
    extends: RequirementSchema,
    properties: {
        email: { type: 'string', nullable: false }
    }
})