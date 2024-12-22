import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from "./ReqType.js";
import { GoalModel, GoalVersionsModel } from "./GoalSchema.js";

@Entity({ discriminatorValue: ReqType.OBSTACLE })
export class ObstacleModel extends GoalModel {
    declare readonly versions: Collection<ObstacleVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.OBSTACLE })
export class ObstacleVersionsModel extends GoalVersionsModel { }