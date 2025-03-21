import { Check, Collection, Entity, Enum, Property, types } from '@mikro-orm/core';
import { StakeholderCategory, StakeholderSegmentation } from '../../../../shared/domain/requirements/enums.js';
import { ComponentModel, ComponentVersionsModel } from './ComponentSchema.js';
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";

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

    @Property({ type: types.integer })
    @Check<StakeholderVersionsModel>({ expression: (cols) => `${cols.interest} >= 0 AND ${cols.interest} <= 100` })
    readonly interest!: number

    @Property({ type: types.integer })
    @Check<StakeholderVersionsModel>({ expression: (cols) => `${cols.influence} >= 0 AND ${cols.influence} <= 100` })
    readonly influence!: number
}