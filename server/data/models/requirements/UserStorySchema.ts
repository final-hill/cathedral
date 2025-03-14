import { Collection, Entity, ManyToOne } from '@mikro-orm/core';
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { ScenarioModel, ScenarioVersionsModel } from './ScenarioSchema.js';
import { FunctionalBehaviorModel } from './FunctionalBehaviorSchema.js';

@Entity({ discriminatorValue: ReqType.USER_STORY })
export class UserStoryModel extends ScenarioModel {
    declare readonly versions: Collection<UserStoryVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.USER_STORY })
export class UserStoryVersionsModel extends ScenarioVersionsModel {
    @ManyToOne({ entity: () => FunctionalBehaviorModel })
    readonly functionalBehavior!: FunctionalBehaviorModel
}