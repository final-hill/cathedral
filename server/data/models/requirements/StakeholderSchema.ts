import { Collection, Entity, Enum, Property, types } from '@mikro-orm/core';
import { StakeholderCategory, StakeholderSegmentation } from '../../../../domain/requirements/index.js';
import { ComponentModel, ComponentVersionsModel } from './ComponentSchema.js';
import { ReqType } from "./ReqType.js";

@Entity({ discriminatorValue: ReqType.STAKEHOLDER })
export class StakeholderModel extends ComponentModel {
    declare readonly versions: Collection<StakeholderVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.STAKEHOLDER })
export class StakeholderVersionsModel extends ComponentVersionsModel {
    @Enum({ items: () => StakeholderSegmentation })
    readonly segmentation!: StakeholderSegmentation

    @Enum({ items: () => StakeholderCategory })
    readonly category!: StakeholderCategory

    @Property({ type: types.integer, check: 'availability >= 0 AND availability <= 100' })
    readonly availability!: number

    @Property({ type: types.integer, check: 'influence >= 0 AND influence <= 100' })
    readonly influence!: number
}