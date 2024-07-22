import { EntitySchema } from "@mikro-orm/core";
import Component from "../../domain/Component.js";
import EnvironmentComponent from "../../domain/EnvironmentComponent.js";
import RequirementSchema from "./RequirementSchema.js";

export default new EntitySchema<EnvironmentComponent, Component>({
    class: EnvironmentComponent,
    extends: RequirementSchema,
    properties: {
        parentComponent: { kind: 'm:1', entity: 'EnvironmentComponent', ref: true, nullable: true }
    }
})