import { Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { GoalModel, GoalVersionsModel } from "./GoalModel.js";

@Entity({ discriminatorValue: ReqType.SITUATION })
export class SituationModel extends GoalModel { }

@Entity({ discriminatorValue: ReqType.SITUATION })
export class SituationVersionsModel extends GoalVersionsModel { }
