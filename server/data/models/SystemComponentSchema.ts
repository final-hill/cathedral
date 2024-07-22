import { EntitySchema } from "@mikro-orm/core";
import Component from "../../domain/Component.js";
import SystemComponent from "../../domain/SystemComponent.js";
import RequirementSchema from "./RequirementSchema.js";

export default new EntitySchema<SystemComponent, Component>({
    class: SystemComponent,
    extends: RequirementSchema,
    properties: {
        parentComponent: { kind: 'm:1', entity: 'SystemComponent', ref: true, nullable: true }
    }
})