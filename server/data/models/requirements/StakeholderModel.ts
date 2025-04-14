import { Entity, Enum, Property, types } from '@mikro-orm/core';
import { StakeholderCategory, StakeholderSegmentation } from '../../../../shared/domain/requirements/enums.js';
import { ComponentModel, ComponentVersionsModel } from './ComponentModel.js';
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";

@Entity({ discriminatorValue: ReqType.STAKEHOLDER })
export class StakeholderModel extends ComponentModel { }

@Entity({ discriminatorValue: ReqType.STAKEHOLDER })
export class StakeholderVersionsModel extends ComponentVersionsModel {
    @Enum({ items: () => StakeholderSegmentation })
    readonly segmentation!: StakeholderSegmentation

    @Enum({ items: () => StakeholderCategory })
    readonly category!: StakeholderCategory

    @Property<StakeholderVersionsModel>({ type: types.integer })
    readonly interest!: number

    @Property<StakeholderVersionsModel>({ type: types.integer })
    readonly influence!: number
}