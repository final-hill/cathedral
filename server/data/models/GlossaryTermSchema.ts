import { EntitySchema } from "@mikro-orm/core";
import Component from "../../domain/requirements/Component.js";
import GlossaryTerm from "../../domain/requirements/GlossaryTerm.js";
import RequirementSchema from "./RequirementSchema.js";

export default new EntitySchema<GlossaryTerm, Component>({
    class: GlossaryTerm,
    extends: RequirementSchema,
    properties: {
        parentComponent: { kind: 'm:1', entity: 'GlossaryTerm', ref: true, nullable: true }
    }
})