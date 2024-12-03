import { EntitySchema } from "@mikro-orm/core";
import { Component, ReqType, Stakeholder, StakeholderCategory, StakeholderSegmentation } from '../../../../domain/requirements/index.js';

export const StakeholderSchema = new EntitySchema<Stakeholder, Component>({
    class: Stakeholder,
    discriminatorValue: ReqType.STAKEHOLDER,
    properties: {
        segmentation: { enum: true, items: () => StakeholderSegmentation },
        category: { enum: true, items: () => StakeholderCategory },
        availability: { type: 'number', check: 'availability >= 0 AND availability <= 100' },
        influence: { type: 'number', check: 'influence >= 0 AND influence <= 100' }
    }
})