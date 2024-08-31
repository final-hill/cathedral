import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Actor, Person } from "../../domain/requirements/index.js";

export default new EntitySchema<Person, Actor>({
    class: Person,
    extends: RequirementSchema,
    properties: {
        email: { type: 'string', nullable: false }
    }
})