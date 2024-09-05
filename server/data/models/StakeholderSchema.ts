import { EntitySchema } from "@mikro-orm/core";
import RequirementSchema from "./RequirementSchema.js";
import {
    Component, Stakeholder, StakeholderSegmentation, StakeholderCategory
} from "../../domain/requirements/index.js";

export default new EntitySchema<Stakeholder, Component>({
    class: Stakeholder,
    extends: RequirementSchema,
    properties: {
        influence: { type: 'number', nullable: false, check: 'influence >= 0 AND influence <= 100' },
        availability: { type: 'number', nullable: false, check: 'availability >= 0 AND availability <= 100' },
        segmentation: { enum: true, items: () => StakeholderSegmentation, nullable: false },
        category: { enum: true, items: () => StakeholderCategory, nullable: false },
        parentComponent: { kind: 'm:1', entity: 'Stakeholder', nullable: true }
    }
})