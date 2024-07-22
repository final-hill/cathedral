import { EntitySchema } from "@mikro-orm/core";
import Component from "../../domain/Component.js";
import RequirementSchema from "./RequirementSchema.js";
import Stakeholder from "../../domain/Stakeholder.js";
import StakeholderSegmentation from "../../domain/StakeholderSegmentation.js";
import StakeholderCategory from "../../domain/StakeholderCategory.js";

export default new EntitySchema<Stakeholder, Component>({
    class: Stakeholder,
    extends: RequirementSchema,
    properties: {
        influence: { type: 'number', nullable: false, check: 'influence >= 0 AND influence <= 100' },
        availability: { type: 'number', nullable: false, check: 'availability >= 0 AND availability <= 100' },
        segmentation: { enum: true, items: () => StakeholderSegmentation, nullable: false },
        category: { enum: true, items: () => StakeholderCategory, nullable: false },
        parentComponent: { kind: 'm:1', entity: 'Stakeholder', ref: true, nullable: true }
    }
})