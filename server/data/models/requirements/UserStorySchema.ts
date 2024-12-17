import { Entity, ManyToOne } from '@mikro-orm/core';
import { ReqType, UserStory } from '../../../../domain/requirements/index.js';
import { ScenarioModel, ScenarioVersionsModel } from './ScenarioSchema.js';

@Entity({ discriminatorValue: ReqType.USER_STORY })
export class UserStoryModel extends ScenarioModel { }

@Entity({ discriminatorValue: ReqType.USER_STORY })
export class UserStoryVersionsModel extends ScenarioVersionsModel {
    @ManyToOne({ entity: 'FunctionalBehavior' })
    readonly functionalBehavior!: UserStory['functionalBehavior'];
}