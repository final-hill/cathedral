import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Component, EnvironmentComponent, ParsedRequirement } from "../../../domain/requirements/index.js";

export default new EntitySchema<EnvironmentComponent, Component>({
    class: EnvironmentComponent,
    extends: RequirementSchema,
    properties: {
        follows: { kind: 'm:1', entity: () => ParsedRequirement, nullable: true },
        parentComponent: { kind: 'm:1', entity: () => EnvironmentComponent, nullable: true }
    }
})