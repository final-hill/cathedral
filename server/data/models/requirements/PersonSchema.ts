import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Actor, ParsedRequirement, Person } from "../../../domain/requirements/index.js";

export default new EntitySchema<Person, Actor>({
    class: Person,
    extends: RequirementSchema,
    properties: {
        follows: { kind: 'm:1', entity: () => ParsedRequirement, nullable: true },
        email: { type: 'string', nullable: true }
    }
})