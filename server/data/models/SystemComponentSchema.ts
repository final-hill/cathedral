import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import { Component, SystemComponent } from "../../domain/requirements/index.js";

export default new EntitySchema<SystemComponent, Component>({
    class: SystemComponent,
    extends: RequirementSchema,
    properties: {
        parentComponent: { kind: 'm:1', entity: 'SystemComponent', ref: true, nullable: true }
    }
})