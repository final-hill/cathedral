import { EntitySchema } from "@mikro-orm/core";
import { Justification, MetaRequirement, ParsedRequirement } from "../../../domain/requirements/index.js";
import MetaRequirementSchema from "./MetaRequirementSchema.js";

export default new EntitySchema<Justification, MetaRequirement>({
    class: Justification,
    extends: MetaRequirementSchema,
    properties: {
        follows: { kind: 'm:1', entity: () => ParsedRequirement, nullable: true }
    }
})