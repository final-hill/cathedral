import { Entity } from '@mikro-orm/core';
import { GoalModel, GoalVersionsModel } from './GoalModel.js';
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";

@Entity({ discriminatorValue: ReqType.CONTEXT_AND_OBJECTIVE })
export class ContextAndObjectiveModel extends GoalModel { }

@Entity({ discriminatorValue: ReqType.CONTEXT_AND_OBJECTIVE })
export class ContextAndObjectiveVersionsModel extends GoalVersionsModel { }