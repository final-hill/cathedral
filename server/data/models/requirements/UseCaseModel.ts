import { Entity, ManyToOne, Property, types } from '@mikro-orm/core';
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { ScenarioModel, ScenarioVersionsModel } from './ScenarioModel.js';
import { AssumptionModel } from './AssumptionModel.js';
import { EffectModel } from './EffectModel.js';

@Entity({ discriminatorValue: ReqType.USE_CASE })
export class UseCaseModel extends ScenarioModel { }

@Entity({ discriminatorValue: ReqType.USE_CASE })
export class UseCaseVersionsModel extends ScenarioVersionsModel {
    @Property({ type: types.string })
    readonly scope!: string

    @Property({ type: types.string })
    readonly level!: string

    @ManyToOne({ entity: () => AssumptionModel })
    readonly precondition!: AssumptionModel

    @Property({ type: types.uuid })
    readonly triggerId!: string

    @Property({ type: types.string })
    readonly mainSuccessScenario!: string

    @ManyToOne({ entity: () => EffectModel })
    readonly successGuarantee!: EffectModel

    @Property({ type: types.string })
    readonly extensions!: string
}