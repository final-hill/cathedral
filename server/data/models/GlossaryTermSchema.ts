import { EntitySchema } from "@mikro-orm/core";
import Component from "../../domain/Component.js";
import GlossaryTerm from "../../domain/GlossaryTerm.js";
import RequirementSchema from "./RequirementSchema.js";

export default new EntitySchema<GlossaryTerm, Component>({
    class: GlossaryTerm,
    extends: RequirementSchema,
    properties: {
        parentComponent: { kind: 'm:1', entity: 'GlossaryTerm', ref: true, nullable: true }
    }
})