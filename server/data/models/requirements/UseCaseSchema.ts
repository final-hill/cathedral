import { Collection, Entity, ManyToOne, Property } from '@mikro-orm/core';
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
    @Property()
    readonly scope!: string

    @Property()
    readonly level!: string

    @ManyToOne({ entity: () => AssumptionModel })
    readonly precondition!: AssumptionModel

    @Property({ type: 'uuid' })
    readonly triggerId!: string

    @Property()
    readonly mainSuccessScenario!: string

    @ManyToOne({ entity: () => EffectModel })
    readonly successGuarantee!: EffectModel

    @Property({ type: 'string' })
    readonly extensions!: string
}