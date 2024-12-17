import { Entity, Enum, Property } from '@mikro-orm/core';
import { Stakeholder, ReqType, StakeholderCategory, StakeholderSegmentation } from '../../../../domain/requirements/index.js';
import { ComponentModel, ComponentVersionsModel } from './ComponentSchema.js';

@Entity({ discriminatorValue: ReqType.STAKEHOLDER })
export class StakeholderModel extends ComponentModel { }

@Entity({ discriminatorValue: ReqType.STAKEHOLDER })
export class StakeholderVersionsModel extends ComponentVersionsModel {
    @Enum({ items: () => StakeholderSegmentation })
    readonly segmentation!: Stakeholder['segmentation'];

    @Enum({ items: () => StakeholderCategory })
    readonly category: Stakeholder['category'];

    @Property({ type: 'number', check: 'availability >= 0 AND availability <= 100' })
    readonly availability!: Stakeholder['availability'];

    @Property({ type: 'number', check: 'influence >= 0 AND influence <= 100' })
    readonly influence!: Stakeholder['influence'];
}