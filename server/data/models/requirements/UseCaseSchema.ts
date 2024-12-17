import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { UseCase, ReqType } from '../../../../domain/requirements/index.js';
import { ScenarioModel, ScenarioVersionsModel } from './ScenarioSchema.js';

@Entity({ discriminatorValue: ReqType.USE_CASE })
export class UseCaseModel extends ScenarioModel { }

@Entity({ discriminatorValue: ReqType.USE_CASE })
export class UseCaseVersionsModel extends ScenarioVersionsModel {
    @Property({ type: 'string' })
    readonly scope!: UseCase['scope'];

    @Property({ type: 'string' })
    readonly level!: UseCase['level'];

    @ManyToOne({ entity: 'Assumption' })
    readonly precondition!: UseCase['precondition'];

    @Property({ type: 'uuid' })
    readonly triggerId!: UseCase['triggerId'];

    @Property({ type: 'string' })
    readonly mainSuccessScenario!: UseCase['mainSuccessScenario'];

    @ManyToOne({ entity: 'Effect' })
    readonly successGuarantee!: UseCase['successGuarantee'];

    @Property({ type: 'string' })
    readonly extensions!: UseCase['extensions'];
}