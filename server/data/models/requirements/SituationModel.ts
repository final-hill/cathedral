import { Entity } from "@mikro-orm/core";
import { ReqType } from "../../../../shared/domain/requirements/ReqType.js";
import { ObstacleModel, ObstacleVersionsModel } from "./ObstacleModel.js";

@Entity({ discriminatorValue: ReqType.SITUATION })
export class SituationModel extends ObstacleModel { }

@Entity({ discriminatorValue: ReqType.SITUATION })
export class SituationVersionsModel extends ObstacleVersionsModel { }
