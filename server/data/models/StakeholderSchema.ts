import { EntitySchema } from "@mikro-orm/core";
import Component from "../../domain/requirements/Component.js";
import RequirementSchema from "./RequirementSchema.js";
import Stakeholder from "../../domain/requirements/Stakeholder.js";
import StakeholderSegmentation from "../../domain/requirements/StakeholderSegmentation.js";
import StakeholderCategory from "../../domain/requirements/StakeholderCategory.js";

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