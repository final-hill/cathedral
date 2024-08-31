import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Component, GlossaryTerm } from "../../domain/requirements/index.js";

export default new EntitySchema<GlossaryTerm, Component>({
    class: GlossaryTerm,
    extends: RequirementSchema,
    properties: {
        parentComponent: { kind: 'm:1', entity: 'GlossaryTerm', ref: true, nullable: true }
    }
})