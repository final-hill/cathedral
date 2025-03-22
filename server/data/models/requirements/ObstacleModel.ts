import { Collection, Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { GoalModel, GoalVersionsModel } from "./GoalModel.js";

@Entity({ discriminatorValue: ReqType.OBSTACLE })
export class ObstacleModel extends GoalModel {
    declare readonly versions: Collection<ObstacleVersionsModel, object>;
}

@Entity({ discriminatorValue: ReqType.OBSTACLE })
export class ObstacleVersionsModel extends GoalVersionsModel { }