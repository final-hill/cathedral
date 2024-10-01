import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import {
    Component, Stakeholder, StakeholderSegmentation, StakeholderCategory,
    ParsedRequirement
} from "../../../domain/requirements/index.js";

export default new EntitySchema<Stakeholder, Component>({
    class: Stakeholder,
    extends: RequirementSchema,
    properties: {
        follows: { kind: 'm:1', entity: () => ParsedRequirement, nullable: true },
        influence: { type: 'number', nullable: false, check: 'influence >= 0 AND influence <= 100' },
        availability: { type: 'number', nullable: false, check: 'availability >= 0 AND availability <= 100' },
        segmentation: { enum: true, items: () => StakeholderSegmentation, nullable: true },
        category: { enum: true, items: () => StakeholderCategory, nullable: true },
        parentComponent: { kind: 'm:1', entity: () => Stakeholder, nullable: true }
    }
})