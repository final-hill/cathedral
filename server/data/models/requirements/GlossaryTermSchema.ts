import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Component, GlossaryTerm, ParsedRequirement } from "../../../domain/requirements/index.js";

export default new EntitySchema<GlossaryTerm, Component>({
    class: GlossaryTerm,
    extends: RequirementSchema,
    properties: {
        follows: { kind: 'm:1', entity: () => ParsedRequirement, nullable: true },
        parentComponent: { kind: 'm:1', entity: () => GlossaryTerm, nullable: true }
    }
})