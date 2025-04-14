import { Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { GoalModel, GoalVersionsModel } from "./GoalModel.js";

@Entity({ discriminatorValue: ReqType.OUTCOME })
export class OutcomeModel extends GoalModel { }

@Entity({ discriminatorValue: ReqType.OUTCOME })
export class OutcomeVersionsModel extends GoalVersionsModel { }