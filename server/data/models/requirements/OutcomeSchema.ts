import { Entity } from "@mikro-orm/core";
import { ReqType } from '../../../../domain/requirements/index.js';
import { GoalModel, GoalVersionsModel } from "./GoalSchema.js";

@Entity({ discriminatorValue: ReqType.OUTCOME })
export class OutcomeModel extends GoalModel { }

@Entity({ discriminatorValue: ReqType.OUTCOME })
export class OutcomeVersionsModel extends GoalVersionsModel { }