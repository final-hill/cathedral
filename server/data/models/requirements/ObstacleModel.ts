import { Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { GoalModel, GoalVersionsModel } from "./GoalModel.js";

@Entity({ discriminatorValue: ReqType.OBSTACLE })
export class ObstacleModel extends GoalModel { }

@Entity({ discriminatorValue: ReqType.OBSTACLE })
export class ObstacleVersionsModel extends GoalVersionsModel { }