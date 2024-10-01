import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Component, ParsedRequirement, SystemComponent } from "../../../domain/requirements/index.js";

export default new EntitySchema<SystemComponent, Component>({
    class: SystemComponent,
    extends: RequirementSchema,
    properties: {
        follows: { kind: 'm:1', entity: () => ParsedRequirement, nullable: true },
        parentComponent: { kind: 'm:1', entity: () => SystemComponent, nullable: true }
    }
})