import { Collection, Entity, ManyToOne, Property, types } from '@mikro-orm/core';
import { ReqType } from "./ReqType.js";
import { ScenarioModel, ScenarioVersionsModel } from './ScenarioSchema.js';
import { AssumptionModel } from './AssumptionSchema.js';
import { EffectModel } from './EffectSchema.js';

@Entity({ discriminatorValue: ReqType.USE_CASE })
export class UseCaseModel extends ScenarioModel {
    declare readonly versions: Collection<UseCaseVersionsModel, object>;
}

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